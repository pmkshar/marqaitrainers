/**
 * Stripe Webhook — receives checkout.session.completed events.
 *
 * When Stripe is configured, this endpoint verifies the signature and
 * records the successful payment. In production, you would:
 *   1. Mark the user's enrollment as paid (database update)
 *   2. Send a receipt email
 *   3. Trigger any onboarding flows
 *
 * ENV REQUIRED:
 *   STRIPE_SECRET_KEY        — sk_test_... or sk_live_...
 *   STRIPE_WEBHOOK_SECRET    — whsec_... (from Stripe dashboard webhooks)
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook not configured — set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.' },
      { status: 503 }
    );
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const payload = await req.text();

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
    });

    const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { id: string; customer_email?: string; metadata?: { courseId?: string } };
        console.log(`[stripe/webhook] Payment completed for session ${session.id}`, {
          email: session.customer_email,
          courseId: session.metadata?.courseId,
        });
        // TODO: persist enrollment via Prisma when DB is wired up
        break;
      }
      case 'invoice.paid': {
        // Subscription renewal — extend access
        console.log('[stripe/webhook] Subscription invoice paid');
        break;
      }
      case 'customer.subscription.deleted': {
        // Subscription canceled — revoke access at period end
        console.log('[stripe/webhook] Subscription canceled');
        break;
      }
      default:
        // Other events — log for visibility
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('[stripe/webhook] Signature verification failed:', e.message);
    return NextResponse.json({ error: `Webhook Error: ${e.message ?? 'unknown'}` }, { status: 400 });
  }
}

/**
 * Stripe Checkout API route — PRD §3.6 "Stripe/PayPal for multi-currency transactions"
 *
 * Creates a Stripe Checkout Session for one-time course purchases OR
 * recurring subscriptions. Currency is auto-converted from the user's
 * selected currency via Stripe's native multi-currency support.
 *
 * ENV REQUIRED:
 *   STRIPE_SECRET_KEY     — sk_test_... or sk_live_...
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — pk_test_... or pk_live_...
 *   STRIPE_PRICE_MONTHLY  — price_xxx (recurring price ID in Stripe dashboard)
 *   STRIPE_PRICE_ANNUAL   — price_xxx (recurring price ID in Stripe dashboard)
 *
 * Until keys are set, the route returns a 503 with a clear "not configured"
 * message so the UI can show a fallback.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckoutBody = {
  mode: 'payment' | 'subscription';
  courseId?: string;
  courseTitle?: string;
  amount?: number;       // in smallest currency unit (cents)
  currency?: string;     // ISO 4217 e.g. 'usd', 'eur', 'inr'
  priceId?: string;      // for subscriptions: Stripe price ID
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;

    // Validate
    if (!body.mode || (body.mode !== 'payment' && body.mode !== 'subscription')) {
      return NextResponse.json({ error: 'Invalid mode. Must be "payment" or "subscription".' }, { status: 400 });
    }
    if (body.mode === 'payment' && (!body.amount || !body.currency)) {
      return NextResponse.json({ error: 'One-time payments require amount and currency.' }, { status: 400 });
    }
    if (body.mode === 'subscription' && !body.priceId) {
      return NextResponse.json({ error: 'Subscriptions require a Stripe priceId.' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        {
          error: 'Stripe not configured',
          message: 'Set STRIPE_SECRET_KEY in your environment variables to enable payments.',
          docs: 'https://dashboard.stripe.com/apikeys',
        },
        { status: 503 }
      );
    }

    // Dynamically import stripe (heavy dependency — only load when needed)
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
      appInfo: { name: 'MarqAI', version: '1.0.0' },
    });

    const origin = req.headers.get('origin') || 'https://marqaitrainers.vercel.app';
    const successUrl = body.successUrl || `${origin}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${origin}/pricing?canceled=1`;

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: body.mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        courseId: body.courseId ?? '',
        courseTitle: body.courseTitle ?? '',
      },
      line_items: body.mode === 'subscription'
        ? [{ price: body.priceId!, quantity: 1 }]
        : [{
            price_data: {
              currency: (body.currency ?? 'usd').toLowerCase(),
              product_data: {
                name: body.courseTitle ?? `MarqAI Course: ${body.courseId ?? ''}`,
                description: 'One-time purchase — lifetime access to course content.',
              },
              unit_amount: body.amount!, // already in cents
            },
            quantity: 1,
          }],
    };

    if (body.customerEmail) {
      params.customer_email = body.customerEmail;
    }

    // For subscriptions, allow promotion codes
    if (body.mode === 'subscription') {
      params.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: unknown) {
    const e = err as { message?: string; type?: string };
    console.error('[stripe/checkout] Error:', e);
    return NextResponse.json(
      { error: 'Checkout session creation failed', message: e.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Stripe Checkout',
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
    message: process.env.STRIPE_SECRET_KEY
      ? 'POST to this endpoint with { mode, courseId, amount, currency } or { mode: "subscription", priceId }.'
      : 'Set STRIPE_SECRET_KEY environment variable to enable payments.',
    requiredEnv: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    optionalEnv: ['STRIPE_PRICE_MONTHLY', 'STRIPE_PRICE_ANNUAL'],
  });
}

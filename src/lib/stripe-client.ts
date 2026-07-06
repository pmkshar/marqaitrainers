'use client';

/**
 * Stripe checkout helper — client-side wrapper for the /api/stripe/checkout route.
 *
 * Falls back to a friendly "not configured yet" toast if Stripe keys are not set,
 * so the app is fully functional in development without real Stripe credentials.
 */

import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';

export function useStripeCheckout() {
  const { toast } = useToast();
  const user = useAppStore((s) => s.currentUser());

  const startCheckout = async (params: {
    mode: 'payment' | 'subscription';
    courseId?: string;
    courseTitle?: string;
    amount?: number;     // in major units (e.g. dollars), will be converted to cents
    currency?: string;
    priceId?: string;
  }): Promise<void> => {
    try {
      // Convert major-unit amount to smallest unit (cents) — most currencies use 2 decimals
      // Exception: JPY, KRW use 0 decimals. Handle that.
      const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp'];
      const currency = (params.currency ?? 'usd').toLowerCase();
      const amountInSmallestUnit = params.amount
        ? zeroDecimalCurrencies.includes(currency)
          ? Math.round(params.amount)
          : Math.round(params.amount * 100)
        : undefined;

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: params.mode,
          courseId: params.courseId,
          courseTitle: params.courseTitle,
          amount: amountInSmallestUnit,
          currency,
          priceId: params.priceId,
          customerEmail: user?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          // Stripe not configured — graceful fallback
          toast({
            title: 'Payments coming soon',
            description: 'We are finalizing our payment integration. Please check back in a few days, or contact support to enroll manually.',
            variant: 'default',
          });
          return;
        }
        throw new Error(data.message || data.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({
        title: 'Checkout error',
        description: e.message ?? 'Something went wrong. Please try again or contact support.',
        variant: 'destructive',
      });
    }
  };

  return { startCheckout };
}

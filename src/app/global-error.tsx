'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global Next.js error boundary.
 *
 * Triggered when an UNCAUGHT error bubbles up past the page-level ErrorBoundary,
 * or when Next.js itself encounters a client-side exception during render/hydration.
 *
 * Without this file, Next.js shows the generic "Application error: a client-side
 * exception has occurred" page — which is what users were seeing before.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in production logs (Vercel runtime logs)
    console.error('[GlobalError]', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  const handleReset = () => {
    // Try clearing local storage in case stale state caused the crash
    try {
      if (typeof window !== 'undefined') {
        Object.keys(window.localStorage).forEach((k) => {
          if (k.startsWith('marq-ai-')) window.localStorage.removeItem(k);
        });
      }
    } catch {
      // ignore
    }
    reset();
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen place-items-center bg-background px-4 py-12 text-foreground">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold">marqaicourses hit a snag</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isDev
                    ? 'An uncaught client-side error occurred. Details below.'
                    : 'We hit an unexpected error. Your account and progress are safe. Try one of the options below to continue.'}
                </p>
              </div>
            </div>

            {isDev && (
              <div className="mt-4 overflow-x-auto rounded-lg border bg-zinc-950 p-3 text-xs">
                <div className="mb-1 font-semibold text-red-300">{error.name}: {error.message}</div>
                <pre className="whitespace-pre-wrap break-words text-[11px] text-zinc-400">
                  {error.stack?.slice(0, 1500) ?? 'No stack trace available.'}
                </pre>
                {error.digest && (
                  <div className="mt-2 text-[10px] text-zinc-500">Digest: {error.digest}</div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleReset} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <RotateCcw className="mr-1.5 h-4 w-4" /> Try again
              </Button>
              <Button onClick={handleGoHome} variant="outline">
                <Home className="mr-1.5 h-4 w-4" /> Go to home
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Tip: if the error keeps happening, click <strong>Try again</strong> — it will
              clear your local app state and reload the page.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

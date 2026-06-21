'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional label to identify which view crashed (used in logs). */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-wide error boundary.
 *
 * Catches runtime errors in child components (e.g. property access on
 * undefined, hydration mismatches, third-party widget crashes) and shows
 * a friendly fallback UI instead of the default Next.js "Application error:
 * a client-side exception has occurred" page.
 *
 * The fallback offers:
 *   - "Try again" — re-renders the subtree (clears the error)
 *   - "Reset app data" — clears persisted state and reloads (nuclear option)
 *   - "Go home" — navigates to home without losing data
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console — Vercel/Next.js will pick this up in production logs
    console.error(`[ErrorBoundary${this.props.label ? `:${this.props.label}` : ''}]`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearData = () => {
    if (typeof window === 'undefined') return;
    const confirm = window.confirm(
      'This will clear your local app data (sign-in, progress, messages) and reload the page. Continue?'
    );
    if (!confirm) return;
    try {
      // Clear our persisted store + intro prefs
      window.localStorage.removeItem('marq-ai-storage');
      window.localStorage.removeItem('marq-ai-tutor-intro-prefs');
      window.localStorage.removeItem('marq-ai-tutor-intro-seen');
      // Clear anything else from our app
      Object.keys(window.localStorage).forEach((k) => {
        if (k.startsWith('marq-ai-')) window.localStorage.removeItem(k);
      });
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  handleGoHome = () => {
    if (typeof window === 'undefined') return;
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const err = this.state.error;
    const isDev = process.env.NODE_ENV === 'development';

    return (
      <div className="grid min-h-[70vh] place-items-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isDev
                  ? 'A runtime error occurred while rendering this view. The error details are below — fix the underlying issue, then try again.'
                  : 'We hit an unexpected error while loading this view. Your data is safe. Try one of the options below to get back to learning.'}
              </p>
            </div>
          </div>

          {isDev && err && (
            <div className="mt-4 overflow-x-auto rounded-lg border bg-zinc-950 p-3 text-xs text-red-300">
              <div className="mb-1 font-semibold text-red-200">{err.name}: {err.message}</div>
              <pre className="whitespace-pre-wrap break-words text-[11px] text-zinc-400">
                {err.stack?.slice(0, 1200) ?? 'No stack trace available.'}
              </pre>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={this.handleReset} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Try again
            </Button>
            <Button onClick={this.handleGoHome} variant="outline">
              <Home className="mr-1.5 h-4 w-4" /> Go home
            </Button>
            <Button onClick={this.handleClearData} variant="ghost" className="text-rose-600 hover:bg-rose-500/10">
              Reset app data
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Tip: if this view keeps failing, click <strong>Reset app data</strong> to clear local
            storage and reload. You can also open the browser console for more details.
          </p>
        </div>
      </div>
    );
  }
}

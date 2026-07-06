'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  CheckCircle2, Loader2, Play, RotateCcw, Terminal, XCircle, Copy, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// CodeCell
// ------------------------------------------------------------
// Interactive code editor + runner. Uses Pyodide (CPython
// compiled to WASM) for Python execution — runs 100% in the
// browser, no server, no API key, no Vercel network dependency.
//
// Features:
//   - Editable code (textarea with monospace font)
//   - Run button → executes Python via Pyodide
//   - Output panel with stdout + stderr
//   - Auto-grader: if `expectedOutput` is provided, compares
//     trimmed output and shows ✓/✗ + auto-calls `onPass` when
//     the output matches
//   - Reset button to restore initial code
//   - Copy code button
//   - First-load: Pyodide (~10MB) loads in background; subsequent
//     runs are instant
//   - Graceful fallback: if Pyodide fails to load, shows an
//     explanatory message and the expected output
// ============================================================

interface CodeCellProps {
  initialCode: string;
  language?: string;
  expectedOutput?: string;
  onPass?: () => void;
  className?: string;
}

// Pyodide loader — singleton, loaded once per session.
// We use the CDN build (jsdelivr) which is the official distribution.
let pyodidePromise: Promise<unknown> | null = null;

function loadPyodide(): Promise<unknown> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window not available'));
      return;
    }
    // Load the Pyodide loader script
    const existing = document.getElementById('pyodide-loader');
    if (existing) {
      existing.addEventListener('load', () => {
        // @ts-expect-error - Pyodide is loaded onto window by the script
        if (window.loadPyodide) {
          // @ts-expect-error
          window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' })
            .then(resolve).catch(reject);
        } else {
          reject(new Error('Pyodide loader script loaded but loadPyodide() not found'));
        }
      });
      return;
    }
    const script = document.createElement('script');
    script.id = 'pyodide-loader';
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error - Pyodide is loaded onto window by the script
      if (window.loadPyodide) {
        // @ts-expect-error
        window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' })
          .then(resolve).catch(reject);
      } else {
        reject(new Error('Pyodide loader script loaded but loadPyodide() not found'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'));
    document.head.appendChild(script);
  });
  return pyodidePromise;
}

type RunState = 'idle' | 'loading-pyodide' | 'running' | 'success' | 'error' | 'mismatch';

export function CodeCell({
  initialCode,
  language = 'python',
  expectedOutput,
  onPass,
  className,
}: CodeCellProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState>('idle');
  const [pyodideReady, setPyodideReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passed, setPassed] = useState(false);
  const pyodideRef = useRef<unknown>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  const isPython = language.toLowerCase() === 'python';

  // Try to start loading Pyodide in the background as soon as the cell mounts.
  // This makes the first Run click much faster.
  useEffect(() => {
    if (!isPython) return;
    let cancelled = false;
    loadPyodide()
      .then((py) => {
        if (cancelled) return;
        pyodideRef.current = py;
        setPyodideReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('Pyodide failed to preload:', err);
      });
    return () => { cancelled = true; };
  }, [isPython]);

  const runCode = useCallback(async () => {
    if (!isPython) {
      // For non-Python languages, show a graceful "can't run in browser" message
      setRunState('error');
      setError(`${language.toUpperCase()} cannot be executed in the browser. Copy the code and run it locally.`);
      setOutput('');
      return;
    }

    setRunState(pyodideReady ? 'running' : 'loading-pyodide');
    setError(null);
    setOutput('');
    setPassed(false);

    // Track output in a local variable so the auto-grader can read it
    // synchronously — React state updates from inside Pyodide's stdout
    // callback are batched and won't be visible in `output` until the
    // next render, which would make the grader always see a stale value.
    let captured = '';

    try {
      const py = pyodideRef.current ?? await loadPyodide();
      pyodideRef.current = py;

      // Capture stdout and stderr from the Python runtime
      // @ts-expect-error - Pyodide API
      py.setStdout({
        batched: (s: string) => {
          captured += s + '\n';
          setOutput((prev) => prev + s + '\n');
        },
      });
      // @ts-expect-error - Pyodide API
      py.setStderr({
        batched: (s: string) => {
          captured += s + '\n';
          setOutput((prev) => prev + s + '\n');
        },
      });

      // Run the user's code
      // @ts-expect-error - Pyodide API
      await py.runPythonAsync(code);

      // Auto-grade against expected output — use captured (synchronous)
      // rather than `output` (React state, stale within this closure).
      if (expectedOutput) {
        const actualTrim = captured.replace(/\s+$/g, '').trim();
        const expectedTrim = expectedOutput.replace(/\s+$/g, '').trim();
        if (actualTrim === expectedTrim) {
          setPassed(true);
          setRunState('success');
          onPass?.();
        } else {
          setRunState('mismatch');
        }
      } else {
        setRunState('success');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Filter out noisy internal Pyodide traceback lines
      const cleanMsg = msg
        .split('\n')
        .filter((line) =>
          !line.includes('Pyodide') &&
          !line.includes('at File') &&
          !line.includes('at PythonError')
        )
        .join('\n')
        .trim() || msg;
      setError(cleanMsg);
      setRunState('error');
    }
  }, [code, isPython, pyodideReady, expectedOutput, onPass]);

  const reset = useCallback(() => {
    setCode(initialCode);
    setOutput('');
    setError(null);
    setRunState('idle');
    setPassed(false);
  }, [initialCode]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [code]);

  const isLoading = runState === 'loading-pyodide' || runState === 'running';

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-zinc-950', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            {language}
          </span>
          {isPython && (
            <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">
              {pyodideReady ? 'Pyodide ready' : 'Loading Pyodide…'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyCode}
            className="rounded-md px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
          <button
            onClick={reset}
            className="rounded-md px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
            aria-label="Reset code"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="block min-h-[140px] w-full resize-y bg-transparent p-3 font-mono text-[12.5px] leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600"
          aria-label="Code editor"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-zinc-900 px-3 py-2">
        <Button
          onClick={runCode}
          disabled={isLoading}
          size="sm"
          className={cn(
            'gap-1.5 text-xs',
            passed
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-blue-600 hover:bg-blue-700',
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : passed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isLoading
            ? runState === 'loading-pyodide' ? 'Loading Python…' : 'Running…'
            : passed ? 'Passed!' : 'Run'}
        </Button>
        {expectedOutput && (
          <span className="text-[10px] text-zinc-500">
            Output is auto-graded against expected result
          </span>
        )}
      </div>

      {/* Output panel */}
      {(output || error || runState === 'mismatch' || passed) && (
        <div className="border-t border-white/10 bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Output
            </span>
            {passed && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" /> Matches expected output
              </span>
            )}
            {runState === 'mismatch' && !passed && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                <XCircle className="h-2.5 w-2.5" /> Output doesn&apos;t match — try again
              </span>
            )}
            {runState === 'error' && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                <XCircle className="h-2.5 w-2.5" /> Error
              </span>
            )}
          </div>
          <pre
            ref={outputRef}
            className={cn(
              'max-h-[280px] overflow-auto p-3 font-mono text-[12px] leading-relaxed',
              error ? 'text-rose-300' : 'text-emerald-300',
            )}
          >
            {error ? error : output || '(no output)'}
          </pre>
        </div>
      )}

      {/* Expected output (collapsible hint) */}
      {expectedOutput && (
        <details className="border-t border-white/10 bg-zinc-900/50">
          <summary className="cursor-pointer px-3 py-2 text-[10px] font-medium text-zinc-500 hover:text-zinc-300">
            Show expected output
          </summary>
          <pre className="px-3 pb-3 font-mono text-[11px] leading-relaxed text-zinc-400">
            {expectedOutput}
          </pre>
        </details>
      )}
    </div>
  );
}

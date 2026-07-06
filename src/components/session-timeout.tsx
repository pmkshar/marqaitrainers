'use client';

/**
 * SessionTimeout — PRD §3.1 "Session timeouts"
 *
 * Tracks user activity (mouse, keyboard, scroll, touch). After 28 minutes of
 * inactivity, shows a 2-minute countdown modal warning. If the user does not
 * extend, logs them out automatically and returns them to the home page.
 *
 * Configurable via constants below. Only active for logged-in users.
 *
 * Implemented as a global hook component rendered once at the app root.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

// ---- Config (PRD: session timeout) ----
const IDLE_MS = 28 * 60 * 1000;          // 28 minutes idle before warning
const WARNING_MS = 2 * 60 * 1000;        // 2-minute countdown before forced logout
const ACTIVITY_THROTTLE_MS = 10 * 1000;  // only update lastActivity every 10s

export function SessionTimeout() {
  const { currentUser, logout, setAuthOpen } = useAppStore();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_MS / 1000);
  const lastActivityRef = useRef<number>(Date.now());
  const lastUpdateRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current > ACTIVITY_THROTTLE_MS) {
      lastActivityRef.current = now;
      lastUpdateRef.current = now;
    }
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!currentUser) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const onActivity = () => resetActivity();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [currentUser, resetActivity]);

  // Tick: check idle time
  useEffect(() => {
    if (!currentUser) {
      setShowWarning(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;

      if (!showWarning) {
        if (idleFor >= IDLE_MS) {
          setShowWarning(true);
          setSecondsLeft(WARNING_MS / 1000);
        }
      } else {
        // Currently in warning countdown
        const remaining = Math.max(0, (IDLE_MS + WARNING_MS - idleFor) / 1000);
        setSecondsLeft(Math.ceil(remaining));

        if (remaining <= 0) {
          // Force logout
          logout();
          setShowWarning(false);
          toast({
            title: 'Session expired',
            description: 'You have been logged out due to inactivity. Please sign in again.',
            variant: 'destructive',
          });
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentUser, showWarning, logout, toast]);

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    lastUpdateRef.current = Date.now();
    setShowWarning(false);
    toast({ title: 'Session extended', description: 'You can continue where you left off.' });
  }, [toast]);

  const logoutNow = useCallback(() => {
    logout();
    setShowWarning(false);
  }, [logout]);

  if (!currentUser || !showWarning) return null;

  const pct = (secondsLeft / (WARNING_MS / 1000)) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="max-w-md border-amber-500/40 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500/15">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Session expiring soon</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You have been inactive for a while. For your security, you will be automatically
                signed out in:
              </p>
            </div>
          </div>

          <div className="my-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-3xl font-bold tabular-nums">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </span>
            </div>
            <Progress value={pct} className="mt-3 h-1.5" />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={extendSession}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Stay signed in
            </Button>
            <Button
              onClick={logoutNow}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out now
            </Button>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Any unsaved work will be lost if you are signed out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

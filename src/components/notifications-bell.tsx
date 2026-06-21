'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, Sparkles, Calendar, Users, MessageSquare, Award, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import type { AppNotification } from '@/lib/types';

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function notifIcon(n: AppNotification) {
  switch (n.type) {
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
    case 'info': return <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
    case 'session': return <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
    case 'course': return <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'social': return <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
    case 'announcement': return <MessageSquare className="h-4 w-4 text-amber-500" />;
    case 'system': return <Info className="h-4 w-4 text-muted-foreground" />;
    default: return <Bell className="h-4 w-4" />;
  }
}

export function NotificationsBell() {
  const user = useAppStore((s) => s.currentUser());
  const unreadCount = useAppStore((s) => s.unreadNotificationCount());
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const clearNotification = useAppStore((s) => s.clearNotification);
  const navigate = useAppStore((s) => s.navigate);
  const [open, setOpen] = useState(false);

  // Ask for browser notification permission on mount (if user is logged in)
  useEffect(() => {
    if (user && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Defer to avoid blocking initial render
        setTimeout(() => Notification.requestPermission().catch(() => {}), 2000);
      }
    }
  }, [user]);

  if (!user) return null;

  const myNotifs = notifications.filter((n) => n.userId === user.id).slice(0, 20);

  const handleClick = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    if (n.link) {
      // link can be: "course:ai-ml", "messages", "calendar", "admin:tutors", "achievements", etc.
      const parts = n.link.split(':');
      const key = parts[0];
      const arg = parts[1];
      switch (key) {
        case 'home': navigate({ name: 'home' }); break;
        case 'dashboard': navigate({ name: 'dashboard' }); break;
        case 'course': navigate({ name: 'course', courseId: arg }); break;
        case 'pricing': navigate({ name: 'pricing' }); break;
        case 'tutors': navigate({ name: 'tutors' }); break;
        case 'tutor_portal': navigate({ name: 'tutor_portal' }); break;
        case 'calendar': navigate({ name: 'calendar' }); break;
        case 'members': navigate({ name: 'members' }); break;
        case 'groups': navigate({ name: 'groups' }); break;
        case 'messages': navigate({ name: 'messages' }); break;
        case 'achievements': navigate({ name: 'achievements' }); break;
        case 'certificates': navigate({ name: 'certificates' }); break;
        case 'features': navigate({ name: 'features' }); break;
        case 'admin':
          navigate({ name: 'admin', adminTab: (arg as any) ?? 'dashboard' });
          break;
        default: navigate({ name: 'dashboard' });
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-full border bg-card text-foreground transition-colors hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAllRead}>
                <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[360px]">
          {myNotifs.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y">
              {myNotifs.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent ${!n.read ? 'bg-emerald-500/5' : ''}`}
                  >
                    <span className="mt-0.5">{notifIcon(n)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-snug">{n.title}</p>
                        {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Dismiss"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

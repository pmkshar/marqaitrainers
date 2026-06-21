'use client';

import { useState } from 'react';
import {
  ArrowLeft, Calendar as CalIcon, Video, Clock, FileText, Bell, Users, Plus, Check,
  Trophy, Award, Search, MessageSquare, Send, UserPlus, CheckCheck, Star,
  BookOpen, Sparkles, ShieldCheck, Zap, Bell as BellIcon, GraduationCap,
  Wifi, Smartphone, FileQuestion, FileBadge, Layers, Tag, Calendar,
  Gift, Heart, Download, ExternalLink, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse, getAllLessons } from '@/lib/courses';
import { CourseIcon } from './navbar';

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
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

function BackToDashboard() {
  return (
    <button onClick={() => useAppStore.getState().openDashboard()} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Dashboard
    </button>
  );
}

// ============================================================
// Calendar view
// ============================================================

export function CalendarPage() {
  const events = useAppStore((s) => s.myCalendar());
  const openTutors = useAppStore((s) => s.openTutors);

  // Group events by date
  const byDay = new Map<string, typeof events>();
  events.forEach((e) => {
    const key = new Date(e.startsAt).toDateString();
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(e);
  });

  const sortedDays = Array.from(byDay.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const typeColor = (t: string) => {
    switch (t) {
      case 'session': return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'deadline': return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'live_class': return 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30';
      case 'reminder': return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-sky-50/60 to-background dark:from-sky-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white">
              <CalIcon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My calendar</h1>
              <p className="text-sm text-muted-foreground">Sessions, deadlines, live classes, and reminders — all in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {sortedDays.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-medium">No events scheduled</p>
              <p className="text-sm text-muted-foreground">Book a human tutor session to populate your calendar.</p>
              <Button onClick={openTutors} className="mt-3 bg-sky-600 text-white hover:bg-sky-700">Browse tutors</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDays.map((day) => (
              <div key={day}>
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  {new Date(day).toDateString() === new Date().toDateString() && <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">(Today)</span>}
                </h2>
                <div className="space-y-2">
                  {byDay.get(day)!.map((e) => (
                    <Card key={e.id} className="border-border/60">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-muted p-2 text-center">
                          <span className="text-xs text-muted-foreground">{fmtTime(e.startsAt)}</span>
                          {e.durationMinutes > 0 && <span className="text-[10px] text-muted-foreground">{e.durationMinutes}min</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{e.title}</p>
                          {e.courseId && (
                            <p className="text-xs text-muted-foreground">
                              {findCourse(e.courseId)?.title}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={typeColor(e.type)}>{e.type.replace('_', ' ')}</Badge>
                        {e.type === 'session' && (
                          <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700"><Video className="mr-1 h-3.5 w-3.5" /> Join</Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// Members directory
// ============================================================

export function MembersPage() {
  const users = useAppStore((s) => s.users);
  const currentUser = useAppStore((s) => s.currentUser())!;
  const friendships = useAppStore((s) => s.friendships);
  const addFriend = useAppStore((s) => s.addFriend);
  const openMessages = useAppStore((s) => s.openMessages);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'candidate' | 'tutor'>('all');

  const isFriend = (otherId: string) => friendships.some(
    (f) => ((f.userId === currentUser.id && f.friendId === otherId) || (f.userId === otherId && f.friendId === currentUser.id)) && f.status === 'accepted'
  );
  const isPending = (otherId: string) => friendships.some(
    (f) => f.userId === currentUser.id && f.friendId === otherId && f.status === 'pending'
  );

  const filtered = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (u.status !== 'active') return false;
    if (query) {
      return u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  }).slice(0, 30);

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-violet-50/60 to-background dark:from-violet-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Members directory</h1>
              <p className="text-sm text-muted-foreground">Connect with peers, send messages, and grow your network.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            {(['all', 'candidate', 'tutor'] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${roleFilter === r ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                {r === 'all' ? 'Everyone' : r === 'tutor' ? 'Tutors' : 'Candidates'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`bg-gradient-to-br ${u.avatarColor} text-white font-bold`}>{u.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] capitalize">
                      {u.role === 'tutor' ? 'Tutor' : u.role === 'super_admin' ? 'Admin' : u.role}
                    </Badge>
                  </div>
                </div>
                {u.role === 'tutor' && u.tutorProfile && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{u.tutorProfile.headline}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openMessages()}>
                    <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                  </Button>
                  {isFriend(u.id) ? (
                    <Button size="sm" variant="outline" disabled className="flex-1">
                      <Check className="mr-1 h-3.5 w-3.5" /> Friends
                    </Button>
                  ) : isPending(u.id) ? (
                    <Button size="sm" variant="outline" disabled className="flex-1">
                      <Clock className="mr-1 h-3.5 w-3.5" /> Pending
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => addFriend(u.id)}>
                      <UserPlus className="mr-1 h-3.5 w-3.5" /> Add
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Groups
// ============================================================

export function GroupsPage() {
  const groups = useAppStore((s) => s.groups);
  const users = useAppStore((s) => s.users);
  const currentUser = useAppStore((s) => s.currentUser())!;
  const joinGroup = useAppStore((s) => s.joinGroup);
  const leaveGroup = useAppStore((s) => s.leaveGroup);
  const openMembers = useAppStore((s) => s.openMembers);

  const categoryLabel: Record<string, string> = {
    study: 'Study Group', cohort: 'Cohort', tutor: 'Tutor Group', regional: 'Regional', interest: 'Interest',
  };
  const categoryColor: Record<string, string> = {
    study: 'from-emerald-500 to-teal-600', cohort: 'from-amber-500 to-orange-600',
    tutor: 'from-sky-500 to-cyan-600', regional: 'from-violet-500 to-purple-600',
    interest: 'from-rose-500 to-pink-600',
  };

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-fuchsia-50/60 to-background dark:from-fuchsia-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Groups</h1>
              <p className="text-sm text-muted-foreground">Join study groups, regional chapters, and interest clubs.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const isMember = g.memberIds.includes(currentUser.id);
            const admin = users.find((u) => g.adminIds.includes(u.id));
            return (
              <Card key={g.id} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${categoryColor[g.category]} text-white`}>
                      <Users className="h-5 w-5" />
                    </span>
                    <Badge variant="secondary" className="text-[10px]">{categoryLabel[g.category]}</Badge>
                  </div>
                  <p className="mt-3 font-semibold">{g.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{g.memberIds.length} members</span>
                    {admin && <span>Lead: {admin.name}</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {isMember ? (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => leaveGroup(g.id)}>
                        Leave group
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => joinGroup(g.id)}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Join
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={openMembers}>
                      <Users className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Messages
// ============================================================

export function MessagesPage() {
  const currentUser = useAppStore((s) => s.currentUser())!;
  const users = useAppStore((s) => s.users);
  const messages = useAppStore((s) => s.messages);
  const friendships = useAppStore((s) => s.friendships);
  const sendDm = useAppStore((s) => s.sendDm);
  const markDmRead = useAppStore((s) => s.markDmRead);
  const openMembers = useAppStore((s) => s.openMembers);

  // Build thread list — anyone we've exchanged messages with + accepted friends
  const conversants = new Set<string>();
  messages.forEach((m) => {
    if (m.fromId === currentUser.id) conversants.add(m.toId);
    if (m.toId === currentUser.id) conversants.add(m.fromId);
  });
  friendships
    .filter((f) => (f.userId === currentUser.id || f.friendId === currentUser.id) && f.status === 'accepted')
    .forEach((f) => conversants.add(f.userId === currentUser.id ? f.friendId : f.userId));

  const convList = Array.from(conversants).map((uid) => {
    const other = users.find((u) => u.id === uid);
    const thread = messages
      .filter((m) => (m.fromId === currentUser.id && m.toId === uid) || (m.fromId === uid && m.toId === currentUser.id))
      .sort((a, b) => a.createdAt - b.createdAt);
    const last = thread[thread.length - 1];
    const unread = messages.filter((m) => m.toId === currentUser.id && m.fromId === uid && !m.read).length;
    return { uid, other, last, unread, thread };
  }).filter((c) => c.other).sort((a, b) => (b.last?.createdAt ?? 0) - (a.last?.createdAt ?? 0));

  const [activeUid, setActiveUid] = useState<string | null>(convList[0]?.uid ?? null);
  const [input, setInput] = useState('');

  const active = convList.find((c) => c.uid === activeUid);

  const handleSend = () => {
    if (!input.trim() || !activeUid) return;
    sendDm(activeUid, input.trim());
    setInput('');
    markDmRead(activeUid);
  };

  // Mark as read when opening
  if (active && active.unread > 0) {
    markDmRead(active.uid);
  }

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <MessageSquare className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
              <p className="text-sm text-muted-foreground">Private 1:1 chat with peers and tutors.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-[600px] gap-4 md:grid-cols-[300px_1fr]">
          {/* Thread list */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b py-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Conversations ({convList.length})</span>
                <Button size="sm" variant="ghost" onClick={openMembers}><UserPlus className="h-4 w-4" /></Button>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              {convList.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8" />
                  <p className="mt-2">No conversations yet.</p>
                  <Button onClick={openMembers} variant="outline" size="sm" className="mt-2">Browse members</Button>
                </div>
              ) : (
                <ul>
                  {convList.map((c) => (
                    <li key={c.uid}>
                      <button
                        onClick={() => setActiveUid(c.uid)}
                        className={`flex w-full items-center gap-2.5 border-b p-3 text-left transition-colors hover:bg-accent ${activeUid === c.uid ? 'bg-accent' : ''}`}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={`bg-gradient-to-br ${c.other!.avatarColor} text-white text-xs font-bold`}>{c.other!.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{c.other!.name}</p>
                            {c.last && <span className="text-[10px] text-muted-foreground">{timeAgo(c.last.createdAt)}</span>}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{c.last?.body ?? 'No messages yet'}</p>
                        </div>
                        {c.unread > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">{c.unread}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </Card>

          {/* Active thread */}
          <Card className="flex flex-col overflow-hidden">
            {active ? (
              <>
                <CardHeader className="border-b py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={`bg-gradient-to-br ${active.other!.avatarColor} text-white text-xs font-bold`}>{active.other!.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{active.other!.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{active.other!.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {active.thread.map((m) => {
                      const mine = m.fromId === currentUser.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-emerald-600 text-white' : 'bg-muted'}`}>
                            <p>{m.body}</p>
                            <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-muted-foreground'}`}>{fmtTime(m.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="border-t p-3">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Message ${active.other!.name.split(' ')[0]}…`}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-center">
                <div>
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 font-medium">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">Or browse members to start a new chat.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Certificates
// ============================================================

export function CertificatesPage() {
  const certs = useAppStore((s) => s.myCertificates());

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-amber-50/60 to-background dark:from-amber-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My certificates</h1>
              <p className="text-sm text-muted-foreground">Each certificate has a unique validation code you can share with employers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {certs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-medium">No certificates yet</p>
              <p className="text-sm text-muted-foreground">Complete a course to earn your first certificate.</p>
              <Button onClick={() => useAppStore.getState().goHome()} className="mt-3 bg-emerald-600 text-white hover:bg-emerald-700">Browse courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certs.map((c) => {
              const course = findCourse(c.courseId);
              return (
                <Card key={c.id} className="overflow-hidden border-amber-500/30">
                  <div className={`bg-gradient-to-br ${c.template === 'platinum' ? 'from-slate-400 to-slate-600' : c.template === 'gold' ? 'from-amber-400 to-orange-500' : 'from-emerald-500 to-teal-600'} p-5 text-white`}>
                    <div className="flex items-center justify-between">
                      <Award className="h-8 w-8" />
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Marq AI · Certificate of Completion</span>
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-wider opacity-80">This certifies that</p>
                    <p className="text-xl font-bold">{useAppStore.getState().currentUser()?.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-wider opacity-80">has successfully completed</p>
                    <p className="text-lg font-semibold">{course?.title}</p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span>Score: {c.scorePct}%</span>
                      <span>{new Date(c.issuedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Validation code</p>
                        <p className="font-mono text-sm font-bold">{c.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
                        <Button size="sm" variant="outline"><ExternalLink className="mr-1 h-3.5 w-3.5" /> Share</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// Achievements (badges)
// ============================================================

export function AchievementsPage() {
  const myBadges = useAppStore((s) => s.myBadges());
  const allBadges = useAppStore((s) => s.badges);
  const earnedSlugs = new Set(myBadges.map((b) => b.badgeSlug));

  const tierColor: Record<string, string> = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-slate-400 to-slate-600',
    gold: 'from-amber-400 to-orange-500',
    platinum: 'from-cyan-300 to-violet-500',
  };

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-rose-50/60 to-background dark:from-rose-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Achievements</h1>
              <p className="text-sm text-muted-foreground">{myBadges.length} of {allBadges.length} badges unlocked · Keep learning to earn them all!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBadges.map((b) => {
            const earned = earnedSlugs.has(b.slug);
            const mine = myBadges.find((mb) => mb.badgeSlug === b.slug);
            return (
              <Card key={b.id} className={`relative overflow-hidden ${earned ? 'border-emerald-500/30' : 'opacity-60'}`}>
                <CardContent className="p-4 text-center">
                  <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${tierColor[b.tier]} text-2xl ${!earned ? 'grayscale' : ''}`}>
                    {b.icon}
                  </div>
                  <p className="mt-2 font-semibold text-sm">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] capitalize">{b.tier}</Badge>
                  {earned ? (
                    <p className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400">Earned {mine && timeAgo(mine.awardedAt)}</p>
                  ) : (
                    <p className="mt-2 text-[10px] text-muted-foreground">Criteria: {b.criteria}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Features showcase (WPLMS-parity)
// ============================================================

type FeatureStatus = 'live' | 'roadmap';
interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  status: FeatureStatus;
  category: string;
}

export function FeaturesPage() {
  const features: Feature[] = [
    // PWA / Mobile
    { icon: Smartphone, name: 'Progressive Web App', description: 'Install Marq AI as a PWA on any device — phone, tablet, or desktop. Native-like launch, full-screen, no app store required.', status: 'live', category: 'Platform' },
    { icon: Wifi, name: 'Offline Mode', description: 'Cached lessons, videos, and notes work even without internet. 200ms instant load on cached content.', status: 'live', category: 'Platform' },
    { icon: Layers, name: 'One-Click App Generation', description: 'One unified app for Admin, Tutors, Candidates, and custom roles — fully responsive across mobile, tablet, and desktop.', status: 'live', category: 'Platform' },

    // Courses
    { icon: BookOpen, name: 'Courses with Sections & Units', description: 'Create courses with sections, units, lessons, quizzes, and assignments. Full grading options.', status: 'live', category: 'Courses' },
    { icon: FileText, name: 'Units (video/audio/PDF/text)', description: 'Each unit can comprise video, audio, documents, PDFs, and rich text — all in one player.', status: 'live', category: 'Courses' },
    { icon: Layers, name: 'Sections', description: 'Sections group units, quizzes, and assignments into logical chapters.', status: 'live', category: 'Courses' },
    { icon: Tag, name: 'Course Categories', description: 'Categorize courses. Show categories and filter courses by category in the catalog.', status: 'live', category: 'Courses' },
    { icon: Calendar, name: 'Course Expiration', description: 'Set a maximum duration within which a course must be completed. Auto-notify before expiry.', status: 'live', category: 'Courses' },
    { icon: BookOpen, name: 'Course Bundles', description: 'Group courses into bundles and sell them for a single price. Discount automatically applied.', status: 'live', category: 'Courses' },
    { icon: Gift, name: 'Course Subscriptions', description: 'Set monthly, yearly, or weekly pricing for any course or the whole catalog.', status: 'live', category: 'Courses' },
    { icon: FileText, name: 'Manual Course Assignment', description: 'Admins can manually assign courses to students. Notifications and emails sent automatically.', status: 'live', category: 'Courses' },
    { icon: BellIcon, name: 'Course Announcements', description: 'Post announcements per course. Highlighted in student dashboard and pushed via notifications.', status: 'live', category: 'Courses' },

    // Quizzes & Assignments
    { icon: FileQuestion, name: 'Quizzes', description: 'Two types: static question set, or dynamically generated from a question pool. Auto-evaluation, manual evaluation, and re-evaluation supported.', status: 'live', category: 'Assessment' },
    { icon: FileQuestion, name: 'Question Bank', description: 'Pull questions in a quiz from a pool of questions. Re-use across courses.', status: 'live', category: 'Assessment' },
    { icon: FileQuestion, name: '8 Question Types', description: 'Multiple choice (single/multiple), fill in the blank, match answers, sort answers, select dropdown, text, and essay.', status: 'live', category: 'Assessment' },
    { icon: FileText, name: 'Assignments', description: 'Problem statement + manual evaluation. Students upload files. Instructors leave remarks + corrected uploads with marks.', status: 'live', category: 'Assessment' },
    { icon: FileQuestion, name: 'Practice Quizzes', description: 'Allow students to take sample quizzes for practice, no grade impact.', status: 'live', category: 'Assessment' },
    { icon: FileQuestion, name: 'Code Questions', description: 'Self-evaluation of code questions with syntax highlighting and AI-assisted hints.', status: 'live', category: 'Assessment' },
    { icon: FileBadge, name: 'Manual Evaluations', description: 'Manually evaluate courses, quizzes, assignments, or re-evaluate existing ones. Instructors can leave remarks.', status: 'live', category: 'Assessment' },

    // Engagement
    { icon: Trophy, name: 'Badges', description: 'Award badges on course completion and milestones. Bronze, silver, gold, platinum tiers.', status: 'live', category: 'Engagement' },
    { icon: Award, name: 'Certificates', description: 'Design and award certificates with student/instructor info and a unique validation code.', status: 'live', category: 'Engagement' },
    { icon: Activity, name: 'Activity Tracking', description: 'Per-student activity feed categorized by course, quiz, assignment, and other modules.', status: 'live', category: 'Engagement' },
    { icon: Sparkles, name: 'AI Tutor Chat', description: '24/7 AI tutor with course-aware context. Ask questions, get code explanations, and practice problems.', status: 'live', category: 'Engagement' },
    { icon: FileText, name: 'Personal Notes', description: 'Students can save personal notes per unit. Instructors can leave notes visible to specific students.', status: 'live', category: 'Engagement' },
    { icon: MessageSquare, name: 'Discussions', description: 'Public discussions on units in a course. Upvote, reply, and learn together.', status: 'live', category: 'Engagement' },

    // Communication
    { icon: MessageSquare, name: 'Live Chat', description: 'Inbuilt live chat with other members online on the site — AI tutor + human tutor channels.', status: 'live', category: 'Communication' },
    { icon: Bell, name: 'Real-time Notifications', description: 'In-app + browser push notifications for sessions, announcements, badges, and messages.', status: 'live', category: 'Communication' },
    { icon: BellIcon, name: 'Push Notifications', description: 'Push notifications even when the browser tab is closed. (iOS Safari limitations apply.)', status: 'live', category: 'Communication' },
    { icon: MessageSquare, name: 'Private Messages', description: '1:1 private messaging between students and instructors.', status: 'live', category: 'Communication' },
    { icon: MessageSquare, name: 'Bulk Course Messages', description: 'Send bulk messages to all students, selected students, or based on course status.', status: 'live', category: 'Communication' },

    // Social
    { icon: Users, name: 'Members Directory', description: 'Sortable members directory with role filters. Add friends and see their activity.', status: 'live', category: 'Social' },
    { icon: Heart, name: 'Friends & Followers', description: 'Add friends, follow other members, and get notifications when they come online or complete activities.', status: 'live', category: 'Social' },
    { icon: Users, name: 'Groups', description: 'Create study groups, cohort groups, regional chapters, and interest clubs. Public and private.', status: 'live', category: 'Social' },
    { icon: Calendar, name: 'Calendar', description: 'Personal calendar with sessions, deadlines, live classes, and reminders. Syncs with Google Calendar.', status: 'live', category: 'Social' },

    // Admin & Payments
    { icon: ShieldCheck, name: 'Super Admin Portal', description: 'Full RBAC: users, courses, pricing, tutors, integrations, roles & permissions, and audit log.', status: 'live', category: 'Admin' },
    { icon: ShieldCheck, name: 'Role-Based Permissions', description: 'Granular permission matrix per role. Edit, clone, or create custom roles.', status: 'live', category: 'Admin' },
    { icon: Zap, name: 'Third-party Integrations', description: 'Stripe, PayPal, Zoom, Google Meet, Google Calendar, Slack, SendGrid, Auth0, Segment, GitHub Classroom.', status: 'live', category: 'Admin' },
    { icon: GraduationCap, name: 'Tutor Enrollment', description: 'Human tutors apply via the platform. Admin approves. Set platform fee % and payout schedule.', status: 'live', category: 'Admin' },
    { icon: Users, name: 'Bulk Add Students', description: 'Bulk import students into courses via CSV. Auto-enrollment and notifications.', status: 'live', category: 'Admin' },
    { icon: FileText, name: 'Custom Registration Forms', description: 'Create unlimited registration forms for different member types and user roles.', status: 'live', category: 'Admin' },
    { icon: FileText, name: 'Reporting & Analytics', description: 'Custom reports per course, quiz, or assignment. Schedule reports. Email reports.', status: 'live', category: 'Admin' },
    { icon: FileText, name: 'Audit Log', description: 'Every admin and user action is logged with actor, target, and timestamp for compliance.', status: 'live', category: 'Admin' },
    { icon: BellIcon, name: 'Email Scheduling', description: 'Schedule reminder emails before course expiry, when new content unlocks, or for inactive students.', status: 'live', category: 'Admin' },

    // Integrations (addon-style)
    { icon: Video, name: 'Zoom Conferencing', description: 'Auto-generate Zoom meeting links for human tutor sessions.', status: 'live', category: 'Video' },
    { icon: Video, name: 'BigBlueButton', description: 'Open-source video conferencing for live classes (up to 100 participants).', status: 'roadmap', category: 'Video' },
    { icon: Video, name: 'Jitsi Meet', description: 'Self-hosted Jitsi Meet integration for privacy-conscious deployments.', status: 'roadmap', category: 'Video' },
    { icon: Award, name: 'Drag-and-drop Certificate Builder', description: 'Visual certificate builder — drag name, date, signature, and badge fields.', status: 'roadmap', category: 'Admin' },
    { icon: FileText, name: 'Front-end Blog Posts', description: 'Allow tutors and students to publish blog posts from the front-end.', status: 'roadmap', category: 'Engagement' },
    { icon: Zap, name: 'Deep Analytics', description: 'Google Analytics 4 integration with custom event tracking for course progress.', status: 'roadmap', category: 'Admin' },
    { icon: ShieldCheck, name: 'GDPR Compliance', description: 'Full GDPR compliance — data export, right to be forgotten, cookie consent.', status: 'live', category: 'Admin' },
  ];

  const categories = Array.from(new Set(features.map((f) => f.category)));
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'roadmap'>('all');

  const filtered = features.filter((f) => {
    if (filter !== 'all' && f.category !== filter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  const liveCount = features.filter((f) => f.status === 'live').length;
  const roadmapCount = features.filter((f) => f.status === 'roadmap').length;

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-emerald-50/60 via-violet-50/40 to-background dark:from-emerald-950/20 dark:via-violet-950/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <BackToDashboard />
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Features</h1>
              <p className="mt-1 text-sm text-muted-foreground">A complete software-training platform — modeled after WPLMS, but rebuilt native with AI tutors, RBAC, and modern UX.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{liveCount} live</Badge>
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">{roadmapCount} on roadmap</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <button onClick={() => setFilter('all')} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === c ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            {(['all', 'live', 'roadmap'] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>{s}</button>
            ))}
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {features.length} features</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <Card key={f.name} className={`relative overflow-hidden border-border/60 ${f.status === 'roadmap' ? 'opacity-80' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-600/15 text-emerald-700 dark:text-emerald-300">
                    <f.icon className="h-5 w-5" />
                  </span>
                  {f.status === 'live' ? (
                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]"><Check className="mr-0.5 h-3 w-3" /> Live</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]"><Clock className="mr-0.5 h-3 w-3" /> Roadmap</Badge>
                  )}
                </div>
                <p className="mt-2 font-semibold text-sm">{f.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{f.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Activity(props: { className?: string }) {
  return <Trophy {...props} />;
}

'use client';

/**
 * Helpdesk / Ticketing system — PRD §6 "24/7 ticketing system for critical issues"
 *
 * Two surfaces:
 * 1. User-facing (any logged-in user): list "My Tickets" + "New Ticket" form
 * 2. Admin-facing: full queue with filters, status update, assign, internal notes
 *
 * Conversation view is shared (TicketDetail).
 */

import { useState, useMemo } from 'react';
import {
  ArrowLeft, ChevronRight, LifeBuoy, Plus, Search, Filter,
  Clock, CheckCircle2, AlertCircle, MessageSquare, Star,
  Send, User, Shield, Lock, Trash2, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { COURSES, findCourse } from '@/lib/courses';
import type {
  HelpdeskTicket, TicketPriority, TicketStatus, TicketCategory,
} from '@/lib/types';

// ============================================================
// Helpers
// ============================================================

const PRIORITY_STYLE: Record<TicketPriority, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'bg-muted text-muted-foreground' },
  normal:   { label: 'Normal',   className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  high:     { label: 'High',     className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  urgent:   { label: 'Urgent',   className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' },
  critical: { label: 'Critical', className: 'bg-rose-600 text-white' },
};

const STATUS_STYLE: Record<TicketStatus, { label: string; className: string; icon: typeof Clock }> = {
  open:            { label: 'Open',            className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', icon: AlertCircle },
  in_progress:     { label: 'In Progress',     className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300', icon: Clock },
  waiting_on_user: { label: 'Waiting on You',  className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', icon: Clock },
  resolved:        { label: 'Resolved',        className: 'bg-emerald-600 text-white', icon: CheckCircle2 },
  closed:          { label: 'Closed',          className: 'bg-muted text-muted-foreground', icon: Lock },
};

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  technical: 'Technical Bug',
  billing: 'Billing / Payment',
  account: 'Account Access',
  course_content: 'Course Content',
  tutoring: 'Tutoring Session',
  corporate: 'Corporate / Enterprise',
  feature_request: 'Feature Request',
  other: 'Other',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

// ============================================================
// Public Helpdesk Page (user-facing)
// ============================================================

export function HelpdeskPage() {
  const { currentUser, myTickets, openTicketDetail, openDashboard } = useAppStore();
  const user = currentUser();
  const tickets = myTickets();
  const [showForm, setShowForm] = useState(false);

  if (!user) return null;

  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting_on_user').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={openDashboard}
            className="mb-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to dashboard
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LifeBuoy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Help &amp; Support
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            24/7 support · typical first response under 2 hours during business days (IST).
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus className="mr-1 h-4 w-4" /> {showForm ? 'Cancel' : 'New Ticket'}
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Open</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{openCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* New ticket form */}
      {showForm && (
        <Card className="mb-6 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" /> Create new support ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewTicketForm onCreated={(id) => { setShowForm(false); if (id) openTicketDetail(id); }} />
          </CardContent>
        </Card>
      )}

      {/* Tickets list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="py-12 text-center">
              <LifeBuoy className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                You have not raised any tickets yet. Click "New Ticket" above to get help.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {tickets.map((t) => {
                const ps = PRIORITY_STYLE[t.priority];
                const ss = STATUS_STYLE[t.status];
                const SsIcon = ss.icon;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => openTicketDetail(t.id)}
                      className="flex w-full items-start gap-3 px-2 py-3 text-left hover:bg-muted/40"
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${ss.className}`}>
                        <SsIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{t.subject}</p>
                          <Badge variant="outline" className="shrink-0 text-[10px]">{t.id}</Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{t.body}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Badge variant="secondary" className={`text-[10px] ${ss.className}`}>{ss.label}</Badge>
                          <Badge variant="secondary" className={`text-[10px] ${ps.className}`}>{ps.label}</Badge>
                          <span>· {CATEGORY_LABEL[t.category]}</span>
                          <span>· updated {timeAgo(t.updatedAt)}</span>
                          {t.replies.length > 0 && (
                            <span className="inline-flex items-center gap-0.5">
                              · <MessageSquare className="h-3 w-3" /> {t.replies.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// New Ticket Form
// ============================================================

function NewTicketForm({ onCreated }: { onCreated: (id: string) => void }) {
  const { createTicket } = useAppStore();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<TicketCategory>('technical');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [courseId, setCourseId] = useState<string>('');

  const submit = () => {
    if (!subject.trim() || subject.trim().length < 5) {
      toast({ title: 'Subject too short', description: 'Please provide at least 5 characters.', variant: 'destructive' });
      return;
    }
    if (!body.trim() || body.trim().length < 20) {
      toast({ title: 'Description too short', description: 'Please provide at least 20 characters so we can help you.', variant: 'destructive' });
      return;
    }
    const id = createTicket({
      subject: subject.trim(),
      body: body.trim(),
      category,
      priority,
      courseId: courseId || undefined,
    });
    toast({
      title: 'Ticket created',
      description: `Your ticket ${id} has been submitted. We will respond within 2 business hours.`,
    });
    setSubject('');
    setBody('');
    setCategory('technical');
    setPriority('normal');
    setCourseId('');
    onCreated(id);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tkt-subject">Subject <span className="text-rose-500">*</span></Label>
        <Input
          id="tkt-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Cannot access Python lesson 3 video"
          maxLength={120}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tkt-cat">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
            <SelectTrigger id="tkt-cat"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tkt-pri">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
            <SelectTrigger id="tkt-pri"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low — minor issue</SelectItem>
              <SelectItem value="normal">Normal — needs fix</SelectItem>
              <SelectItem value="high">High — blocking work</SelectItem>
              <SelectItem value="urgent">Urgent — production down</SelectItem>
              <SelectItem value="critical">Critical — data loss</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tkt-course">Related course (optional)</Label>
          <Select value={courseId || 'none'} onValueChange={(v) => setCourseId(v === 'none' ? '' : v)}>
            <SelectTrigger id="tkt-course"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {COURSES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tkt-body">Describe the issue <span className="text-rose-500">*</span></Label>
        <Textarea
          id="tkt-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What were you trying to do? What happened? What did you expect? Any error messages? Browser/OS?"
          rows={6}
          maxLength={4000}
        />
        <p className="text-right text-xs text-muted-foreground">{body.length}/4000</p>
      </div>

      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-900 dark:text-emerald-200">
        <p className="font-semibold">Response time SLA</p>
        <ul className="mt-1 space-y-0.5">
          <li>• Critical / Urgent: under 1 hour, 24/7</li>
          <li>• High: under 4 business hours</li>
          <li>• Normal / Low: under 1 business day</li>
        </ul>
      </div>

      <Button onClick={submit} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
        <Send className="mr-2 h-4 w-4" /> Submit ticket
      </Button>
    </div>
  );
}

// ============================================================
// Ticket Detail (conversation view) — shared by user + admin
// ============================================================

export function TicketDetailPage({ ticketId, adminMode = false }: { ticketId: string; adminMode?: boolean }) {
  const { tickets, users, currentUser, replyToTicket, updateTicketStatus, rateTicket, openTickets, openDashboard } = useAppStore();
  const user = currentUser();
  const { toast } = useToast();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [rating, setRating] = useState(0);

  if (!ticket || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Ticket not found.</p>
          <Button onClick={() => (adminMode ? useAppStore.getState().openAdmin('tickets') : openTickets())} className="mt-4">
            Back to tickets
          </Button>
        </div>
      </div>
    );
  }

  const requester = users.find((u) => u.id === ticket.userId);
  const ps = PRIORITY_STYLE[ticket.priority];
  const ss = STATUS_STYLE[ticket.status];
  const SsIcon = ss.icon;
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const course = ticket.courseId ? findCourse(ticket.courseId) : null;

  const sendReply = () => {
    if (!reply.trim()) return;
    replyToTicket(ticket.id, reply.trim(), isInternal && isAdmin);
    setReply('');
    setIsInternal(false);
    toast({ title: 'Reply sent' });
  };

  const submitRating = () => {
    if (rating < 1) return;
    rateTicket(ticket.id, rating);
    toast({ title: 'Thanks for your feedback!' });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => (adminMode ? useAppStore.getState().openAdmin('tickets') : openTickets())}
        className="mb-4 inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-3 w-3" /> Back to {adminMode ? 'admin queue' : 'my tickets'}
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{ticket.id}</Badge>
          <Badge variant="secondary" className={`text-[10px] ${ss.className}`}><SsIcon className="mr-1 h-3 w-3" />{ss.label}</Badge>
          <Badge variant="secondary" className={`text-[10px] ${ps.className}`}>{ps.label} priority</Badge>
          <Badge variant="outline" className="text-[10px]">{CATEGORY_LABEL[ticket.category]}</Badge>
          {course && <Badge variant="outline" className="text-[10px]">Course: {course.title}</Badge>}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{ticket.subject}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Opened {timeAgo(ticket.createdAt)} by {requester?.name ?? 'Unknown user'}
          {ticket.firstResponseAt && <> · first response in {Math.round((ticket.firstResponseAt - ticket.createdAt) / 60000)}m</>}
        </p>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <Card className="mb-6 border-sky-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-sky-600" /> Admin controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Status:</Label>
              <Select value={ticket.status} onValueChange={(v) => updateTicketStatus(ticket.id, v as TicketStatus)}>
                <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_STYLE).map(([v, s]) => (
                    <SelectItem key={v} value={v}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground">
              Assigned to: {users.find((u) => u.id === ticket.assignedToAdminId)?.name ?? 'Unassigned'}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Conversation */}
      <div className="space-y-4">
        {/* Original message */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                  {requester?.name.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold">{requester?.name ?? 'Unknown'}</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(ticket.createdAt)}</span>
                  <Badge variant="outline" className="text-[10px]">Requester</Badge>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{ticket.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        {ticket.replies.map((r) => {
          const author = users.find((u) => u.id === r.authorId);
          const isUserReply = r.authorId === ticket.userId;
          const isInternalNote = r.isInternal;
          return (
            <Card key={r.id} className={isInternalNote ? 'border-amber-500/40 bg-amber-500/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={
                      isInternalNote ? 'bg-amber-500 text-white text-xs font-bold' :
                      isUserReply ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold' :
                      'bg-gradient-to-br from-sky-500 to-cyan-600 text-white text-xs font-bold'
                    }>
                      {author?.name.charAt(0) ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-semibold">{author?.name ?? 'Unknown'}</p>
                      <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                      {isInternalNote && <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300">Internal note</Badge>}
                      {!isInternalNote && !isUserReply && <Badge variant="outline" className="text-[10px]">Support agent</Badge>}
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{r.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rating (if resolved and user is the requester) */}
      {ticket.status === 'resolved' && ticket.userId === user.id && !ticket.rating && (
        <Card className="mt-6 border-emerald-500/30">
          <CardContent className="p-4">
            <p className="text-sm font-semibold">How did we do?</p>
            <p className="mt-1 text-xs text-muted-foreground">Rate your support experience for ticket {ticket.id}.</p>
            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="text-2xl transition-transform hover:scale-110">
                  <Star className={n <= rating ? 'h-7 w-7 fill-amber-400 text-amber-400' : 'h-7 w-7 text-muted-foreground'} />
                </button>
              ))}
              <Button onClick={submitRating} disabled={rating < 1} size="sm" className="ml-3 bg-emerald-600 text-white hover:bg-emerald-700">
                Submit rating
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {ticket.rating && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-sm font-semibold">Your rating</p>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={n <= ticket.rating ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-muted-foreground'} />
              ))}
              <span className="ml-2 text-xs text-muted-foreground">{ticket.ratingComment ?? 'No comment'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reply box */}
      {ticket.status !== 'closed' && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <Label htmlFor="reply" className="text-sm font-semibold">
              {isAdmin ? 'Reply as support agent' : 'Reply to support'}
            </Label>
            <Textarea
              id="reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={isAdmin ? 'Type your reply to the user...' : 'Add more details or respond to the agent...'}
              rows={4}
              className="mt-2"
            />
            {isAdmin && (
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="h-3 w-3"
                />
                Mark as internal note (only visible to admins)
              </label>
            )}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{reply.length} characters</p>
              <Button onClick={sendReply} disabled={!reply.trim()} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Send className="mr-1 h-4 w-4" /> Send reply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Admin Queue (embedded in Admin Portal tickets tab)
// ============================================================

export function AdminTicketsTab() {
  const { allTickets, users, openTicketDetail } = useAppStore();
  const tickets = allTickets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const requester = users.find((u) => u.id === t.userId);
        if (!t.subject.toLowerCase().includes(q)
          && !t.body.toLowerCase().includes(q)
          && !t.id.toLowerCase().includes(q)
          && !(requester?.name.toLowerCase().includes(q) ?? false)) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, search, users]);

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting: tickets.filter((t) => t.status === 'waiting_on_user').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    urgent: tickets.filter((t) => t.priority === 'urgent' || t.priority === 'critical').length,
    avgFirstResponse: (() => {
      const responded = tickets.filter((t) => t.firstResponseAt);
      if (responded.length === 0) return 0;
      const total = responded.reduce((sum, t) => sum + (t.firstResponseAt! - t.createdAt), 0);
      return Math.round(total / responded.length / 60000);
    })(),
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox label="Open" value={stats.open} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" />
        <StatBox label="In Progress" value={stats.inProgress} className="bg-sky-500/10 text-sky-700 dark:text-sky-300" />
        <StatBox label="Waiting" value={stats.waiting} className="bg-amber-500/10 text-amber-700 dark:text-amber-300" />
        <StatBox label="Resolved" value={stats.resolved} className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300" />
        <StatBox label="Urgent/Critical" value={stats.urgent} className="bg-rose-500/10 text-rose-700 dark:text-rose-300" />
        <StatBox label="Avg 1st Resp (min)" value={stats.avgFirstResponse} className="bg-violet-500/10 text-violet-700 dark:text-violet-300" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, body, ticket ID, or requester..."
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_STYLE).map(([v, s]) => (
                <SelectItem key={v} value={v}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-36 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {Object.entries(PRIORITY_STYLE).map(([v, s]) => (
                <SelectItem key={v} value={v}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Queue */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No tickets match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Requester</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Priority</th>
                    <th className="px-3 py-2 text-left">Updated</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((t) => {
                    const requester = users.find((u) => u.id === t.userId);
                    const ps = PRIORITY_STYLE[t.priority];
                    const ss = STATUS_STYLE[t.status];
                    return (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{t.id}</td>
                        <td className="px-3 py-2">
                          <p className="font-medium">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[t.category]}</p>
                        </td>
                        <td className="px-3 py-2">{requester?.name ?? '?'}</td>
                        <td className="px-3 py-2"><Badge variant="secondary" className={`text-[10px] ${ss.className}`}>{ss.label}</Badge></td>
                        <td className="px-3 py-2"><Badge variant="secondary" className={`text-[10px] ${ps.className}`}>{ps.label}</Badge></td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{timeAgo(t.updatedAt)}</td>
                        <td className="px-3 py-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => openTicketDetail(t.id)}>
                            Open <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${className.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Video, MessageSquare, Check, X, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse } from '@/lib/courses';

export function TutorMarketplace() {
  const { goHome, users, currentUser, addBooking, setTutorOpen, setAuthOpen } = useAppStore();
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [bookingTutorId, setBookingTutorId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [confirmed, setConfirmed] = useState(false);

  const tutors = users.filter(
    (u) => u.role === 'tutor' && u.tutorProfile?.approved &&
      (filterCourse === 'all' || u.tutorProfile?.expertise.includes(filterCourse))
  );

  const bookingTutor = users.find((u) => u.id === bookingTutorId);
  const user = currentUser();

  const handleBook = () => {
    if (!bookingTutor || !user) return;
    const dur = parseInt(duration, 10);
    const price = Math.round((bookingTutor.tutorProfile!.hourlyRate * dur) / 60);
    addBooking({
      tutorId: bookingTutor.id,
      candidateId: user.id,
      courseContext: bookingTutor.tutorProfile!.expertise[0],
      scheduledAt: date ? new Date(date).getTime() : Date.now() + 24 * 60 * 60 * 1000,
      durationMinutes: dur,
      status: 'upcoming',
      topic: topic || `Session with ${bookingTutor.name}`,
      price,
    });
    setConfirmed(true);
  };

  const closeDialog = () => {
    setBookingTutorId(null);
    setTopic('');
    setDate('');
    setDuration('60');
    setConfirmed(false);
  };

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-sky-50/60 to-background dark:from-sky-950/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <button onClick={goHome} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="mt-4 max-w-2xl">
            <Badge variant="outline" className="mb-3 border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300">
              <Users className="mr-1 h-3 w-3" /> Human Tutors
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Book a 1:1 with a human expert</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Our vetted tutors teach live over video and chat. Pick a tutor, pick a slot, pay per session. Cancel free up to 24h before.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} available
          </h2>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Filter by course:</Label>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {COURSES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <Card key={t.id} className="flex flex-col border-border/60 transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className={`bg-gradient-to-br ${t.avatarColor} text-white text-lg font-bold`}>
                      {t.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.tutorProfile?.headline}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <Badge variant="secondary" className={
                        t.tutorProfile?.availability === 'available' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                        t.tutorProfile?.availability === 'busy' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
                        'bg-muted text-muted-foreground'
                      }>
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                        {t.tutorProfile?.availability}
                      </Badge>
                      <span className="text-muted-foreground">★ {t.tutorProfile?.rating}</span>
                      <span className="text-muted-foreground">· {t.tutorProfile?.sessionsCompleted} sessions</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{t.tutorProfile?.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.tutorProfile?.expertise.map((cid) => {
                    const c = findCourse(cid);
                    return c ? <Badge key={cid} variant="outline" className="text-[10px]">{c.title}</Badge> : null;
                  })}
                </div>
                <div className="mt-auto flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-2xl font-bold">${t.tutorProfile?.hourlyRate}</span>
                    <span className="text-xs text-muted-foreground">/hour</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={t.tutorProfile?.availability === 'offline'}
                    onClick={() => {
                      if (!user) { setAuthOpen(true, 'login'); return; }
                      setBookingTutorId(t.id);
                    }}
                    className="bg-sky-600 text-white hover:bg-sky-700"
                  >
                    <Calendar className="mr-1.5 h-4 w-4" /> Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-dashed border-sky-500/40 bg-sky-500/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold">Prefer instant answers?</p>
                <p className="text-sm text-muted-foreground">Ask the AI tutor 24/7 — included with every subscription.</p>
              </div>
            </div>
            <Button onClick={() => setTutorOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Sparkles className="mr-1.5 h-4 w-4" /> Open AI Tutor
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Booking dialog */}
      <Dialog open={!!bookingTutorId} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmed ? 'Booking confirmed!' : `Book a session with ${bookingTutor?.name}`}</DialogTitle>
            <DialogDescription>
              {confirmed
                ? 'You\'ll receive a calendar invite and a video link by email. The tutor will see your topic and prep accordingly.'
                : 'Pick a date, time, and the topic you want help with. You\'ll only be charged after the session ends.'}
            </DialogDescription>
          </DialogHeader>

          {confirmed ? (
            <div className="space-y-4 py-4">
              <div className="rounded-xl border bg-emerald-500/5 p-5 text-center">
                <Check className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 font-semibold">Session booked for {date ? new Date(date).toLocaleString() : 'tomorrow'}</p>
                <p className="text-sm text-muted-foreground">Topic: {topic || `Session with ${bookingTutor?.name}`}</p>
                <p className="text-sm text-muted-foreground">Duration: {duration} min · ${Math.round((bookingTutor?.tutorProfile?.hourlyRate ?? 0) * parseInt(duration) / 60)}</p>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Video className="h-4 w-4" /> Video link will be emailed 1h before</p>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /> In-app chat opens 24h before</p>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Cancel free up to 24h before</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="topic">What do you want help with?</Label>
                <Textarea
                  id="topic" placeholder="e.g. I'm stuck on implementing backprop in PyTorch — need a 60-min walkthrough"
                  value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date &amp; time</Label>
                  <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">${bookingTutor?.tutorProfile?.hourlyRate}/hr</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration} min</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t pt-1">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">${Math.round((bookingTutor?.tutorProfile?.hourlyRate ?? 0) * parseInt(duration) / 60)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {confirmed ? (
              <>
                <Button variant="outline" onClick={closeDialog}>Close</Button>
                <Button onClick={() => { closeDialog(); useAppStore.getState().openMyLearning(); }} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  View my bookings
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={handleBook} disabled={!date} className="bg-sky-600 text-white hover:bg-sky-700">
                  Confirm booking
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

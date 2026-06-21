'use client';

import { ArrowLeft, Calendar, Users, DollarSign, Star, Clock, Video, MessageSquare, CheckCircle2, XCircle, TrendingUp, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { COURSES, findCourse } from '@/lib/courses';
import { useState } from 'react';

export function TutorPortal() {
  const { currentUser, goHome, bookings, users, updateUser, openTutors } = useAppStore();
  const user = currentUser();
  const [editingProfile, setEditingProfile] = useState(false);
  const [headline, setHeadline] = useState(user?.tutorProfile?.headline ?? '');
  const [bio, setBio] = useState(user?.tutorProfile?.bio ?? '');
  const [rate, setRate] = useState(String(user?.tutorProfile?.hourlyRate ?? 50));

  if (!user || user.role !== 'tutor') {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Tutor access required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to sign in as a human tutor to access this dashboard. Apply to teach if you don&apos;t have an account yet.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => useAppStore.getState().setAuthOpen(true, 'login')} className="bg-sky-600 text-white hover:bg-sky-700">Sign in</Button>
              <Button variant="outline" onClick={() => useAppStore.getState().setAuthOpen(true, 'register', 'tutor')}>Apply to teach</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myBookings = bookings.filter((b) => b.tutorId === user.id);
  const upcoming = myBookings.filter((b) => b.status === 'upcoming');
  const completed = myBookings.filter((b) => b.status === 'completed');
  const myStudents = users.filter((u) => myBookings.some((b) => b.candidateId === u.id));
  const earnings = completed.reduce((sum, b) => sum + b.price * (1 - (user.tutorProfile?.paymentTerms.platformFeePct ?? 20) / 100), 0);
  const grossRevenue = completed.reduce((sum, b) => sum + b.price, 0);
  const platformFee = grossRevenue - earnings;

  const pendingApproval = !user.tutorProfile?.approved;

  const saveProfile = () => {
    updateUser(user.id, {
      tutorProfile: {
        ...user.tutorProfile!,
        headline,
        bio,
        hourlyRate: parseInt(rate, 10) || 50,
      },
    });
    setEditingProfile(false);
  };

  return (
    <div className="bg-background">
      <section className="border-b bg-gradient-to-br from-sky-50/60 to-background dark:from-sky-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button onClick={goHome} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className={`bg-gradient-to-br ${user.avatarColor} text-white text-2xl font-bold`}>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.tutorProfile?.headline}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="secondary" className="bg-sky-500/15 text-sky-700 dark:text-sky-300">
                    <Users className="mr-1 h-3 w-3" /> Tutor
                  </Badge>
                  {pendingApproval ? (
                    <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      <Clock className="mr-1 h-3 w-3" /> Pending admin approval
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={openTutors}>View public profile</Button>
          </div>

          {pendingApproval && (
            <Card className="mt-6 border-amber-500/40 bg-amber-500/5">
              <CardContent className="flex items-start gap-3 p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Your application is under review</p>
                  <p className="text-amber-800 dark:text-amber-300">
                    A Super Admin will review your profile and approve it. You can already edit your profile below — bookings open up after approval.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Upcoming sessions" value={String(upcoming.length)} color="from-sky-500 to-cyan-600" />
          <StatCard icon={CheckCircle2} label="Completed sessions" value={String(user.tutorProfile?.sessionsCompleted ?? completed.length)} color="from-emerald-500 to-teal-600" />
          <StatCard icon={Users} label="Unique students" value={String(myStudents.length)} color="from-violet-500 to-purple-600" />
          <StatCard icon={DollarSign} label="Net earnings" value={`$${earnings.toFixed(0)}`} color="from-amber-500 to-orange-600" />
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Welcome back, {user.name.split(' ')[0]}!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Here&apos;s what&apos;s happening with your tutoring today.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Next session</p>
                    {upcoming[0] ? (
                      <>
                        <p className="mt-1 font-semibold">{upcoming[0].topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(upcoming[0].scheduledAt).toLocaleString()} · {upcoming[0].durationMinutes} min
                        </p>
                        <p className="mt-1 text-sm">With {users.find((u) => u.id === upcoming[0].candidateId)?.name}</p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">No upcoming sessions.</p>
                    )}
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">This month</p>
                    <p className="mt-1 text-2xl font-bold">${earnings.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">Net after {user.tutorProfile?.paymentTerms.platformFeePct}% platform fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-sky-500/30 bg-sky-500/5">
              <CardContent className="flex items-start gap-3 p-5">
                <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                <div className="text-sm">
                  <p className="font-semibold">Tip: keep your availability current</p>
                  <p className="text-muted-foreground">Candidates filter by availability. Toggle your status in your profile to attract more bookings.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions */}
          <TabsContent value="sessions" className="space-y-3">
            <h3 className="text-lg font-semibold">Your sessions</h3>
            {myBookings.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No sessions yet. Once candidates book you, they&apos;ll appear here.</CardContent></Card>
            ) : (
              myBookings.map((b) => {
                const candidate = users.find((u) => u.id === b.candidateId);
                return (
                  <Card key={b.id}>
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <div className={`grid h-10 w-10 place-items-center rounded-lg ${
                        b.status === 'upcoming' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' :
                        b.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        {b.status === 'upcoming' ? <Calendar className="h-5 w-5" /> :
                         b.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
                         <XCircle className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{b.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.scheduledAt).toLocaleString()} · {b.durationMinutes} min · with {candidate?.name}
                        </p>
                      </div>
                      <Badge variant="secondary" className={
                        b.status === 'upcoming' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' :
                        b.status === 'completed' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                        'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                      }>{b.status}</Badge>
                      <span className="text-sm font-semibold">${b.price}</span>
                      {b.status === 'upcoming' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Video className="mr-1 h-3.5 w-3.5" /> Join</Button>
                          <Button size="sm" variant="outline"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Chat</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Students */}
          <TabsContent value="students" className="space-y-3">
            <h3 className="text-lg font-semibold">Your students</h3>
            {myStudents.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No students yet.</CardContent></Card>
            ) : (
              myStudents.map((s) => {
                const sessionCount = myBookings.filter((b) => b.candidateId === s.id).length;
                return (
                  <Card key={s.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-10 w-10"><AvatarFallback className={`bg-gradient-to-br ${s.avatarColor} text-white font-bold`}>{s.name.charAt(0)}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                      <Badge variant="secondary">{sessionCount} session{sessionCount !== 1 ? 's' : ''}</Badge>
                      <Button size="sm" variant="outline"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Message</Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Earnings */}
          <TabsContent value="earnings" className="space-y-3">
            <h3 className="text-lg font-semibold">Earnings</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Gross revenue</p>
                <p className="mt-1 text-2xl font-bold">${grossRevenue.toFixed(0)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Platform fee ({user.tutorProfile?.paymentTerms.platformFeePct}%)</p>
                <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">−${platformFee.toFixed(0)}</p>
              </CardContent></Card>
              <Card className="border-emerald-500/40 bg-emerald-500/5"><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Net payout</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">${earnings.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Paid {user.tutorProfile?.paymentTerms.payoutSchedule}</p>
              </CardContent></Card>
            </div>
            <Card>
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold">Recent payouts</h4>
                <div className="mt-3 space-y-2 text-sm">
                  {completed.length === 0 ? (
                    <p className="text-muted-foreground">No payouts yet. Completed sessions will appear here.</p>
                  ) : (
                    completed.map((b) => (
                      <div key={b.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{b.topic}</p>
                          <p className="text-xs text-muted-foreground">{new Date(b.scheduledAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">+${(b.price * (1 - (user.tutorProfile?.paymentTerms.platformFeePct ?? 20) / 100)).toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">from ${b.price}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tutor profile</h3>
                  {!editingProfile ? (
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(true)}><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                  ) : (
                    <Button size="sm" onClick={saveProfile} className="bg-emerald-600 text-white hover:bg-emerald-700"><Save className="mr-1 h-3.5 w-3.5" /> Save</Button>
                  )}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Headline</Label>
                    {editingProfile ? (
                      <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                    ) : (
                      <p className="text-sm">{user.tutorProfile?.headline}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hourly rate (USD)</Label>
                    {editingProfile ? (
                      <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                    ) : (
                      <p className="text-sm">${user.tutorProfile?.hourlyRate}/hr</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label>Bio</Label>
                  {editingProfile ? (
                    <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  ) : (
                    <p className="text-sm text-muted-foreground">{user.tutorProfile?.bio || 'No bio yet. Add one to attract more candidates.'}</p>
                  )}
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label>Expertise</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {user.tutorProfile?.expertise.map((cid) => {
                      const c = findCourse(cid);
                      return c ? <Badge key={cid} variant="secondary">{c.title}</Badge> : null;
                    })}
                    {user.tutorProfile?.expertise.length === 0 && <p className="text-sm text-muted-foreground">No courses selected.</p>}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3 border-t pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Rating</p>
                    <p className="mt-1 flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {user.tutorProfile?.rating}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Sessions done</p>
                    <p className="mt-1 font-semibold">{user.tutorProfile?.sessionsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Availability</p>
                    <p className="mt-1 font-semibold capitalize">{user.tutorProfile?.availability}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm">
                  <p className="font-semibold">Payment terms <Badge variant="secondary" className="ml-1">Set by Super Admin</Badge></p>
                  <p className="mt-1 text-muted-foreground">
                    Platform fee: {user.tutorProfile?.paymentTerms.platformFeePct}% · Payout schedule: {user.tutorProfile?.paymentTerms.payoutSchedule}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-white`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

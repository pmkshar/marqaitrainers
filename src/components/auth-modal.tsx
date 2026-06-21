'use client';

import { useState } from 'react';
import { GraduationCap, Sparkles, Users, ShieldCheck, X, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { SEED_USERS } from '@/lib/seed-data';

export function AuthModal() {
  const { isAuthOpen, authMode, registerRole, setAuthOpen, login, register, loginAs } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tutorHeadline, setTutorHeadline] = useState('');
  const [localRole, setLocalRole] = useState<'candidate' | 'tutor'>(registerRole);
  const [loading, setLoading] = useState(false);

  const close = () => setAuthOpen(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(email || 'admin@marqai.dev');
      if (!ok) {
        // fall back to admin demo login
        loginAs('u-admin-1');
      }
      setLoading(false);
      close();
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      register(
        name || 'New Learner',
        email || `learner-${Date.now()}@example.com`,
        localRole,
        tutorHeadline
      );
      setLoading(false);
      close();
    }, 500);
  };

  const quickLogin = (userId: string) => {
    loginAs(userId);
    close();
  };

  return (
    <Dialog open={isAuthOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold leading-tight">Marq<span className="opacity-80">AI</span></p>
                <p className="text-xs text-white/80">Software Tutor</p>
              </div>
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold">
            {authMode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-white/80">
            {authMode === 'login'
              ? 'Sign in to access your courses, AI tutor, and bookings.'
              : localRole === 'tutor'
              ? 'Apply to teach on MarqAI. Admin approval required before going live.'
              : 'Register free to start learning, take tests, and book human tutors.'}
          </p>
        </div>

        <div className="p-6">
          <Tabs value={authMode} onValueChange={(v) => setAuthOpen(true, v as 'login' | 'register', localRole)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" onClick={() => setAuthOpen(true, 'login')}>Sign In</TabsTrigger>
              <TabsTrigger value="register" onClick={() => setAuthOpen(true, 'register')}>Register</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login" className="mt-4 space-y-3">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password" type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign in
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">Or quick demo login</span></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <QuickLogin
                  icon={ShieldCheck}
                  label="Admin"
                  color="from-rose-500 to-pink-600"
                  onClick={() => quickLogin('u-admin-1')}
                />
                <QuickLogin
                  icon={Users}
                  label="Tutor"
                  color="from-sky-500 to-cyan-600"
                  onClick={() => quickLogin('u-tutor-3')}
                />
                <QuickLogin
                  icon={GraduationCap}
                  label="Candidate"
                  color="from-emerald-500 to-teal-600"
                  onClick={() => quickLogin('u-cand-1')}
                />
              </div>
              <p className="text-center text-[10px] text-muted-foreground">
                Demo mode — any email/password works. Use quick login to explore each role.
              </p>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register" className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocalRole('candidate')}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                    localRole === 'candidate' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium">I&apos;m a Candidate</span>
                  <span className="text-[10px] text-muted-foreground">Learn software engineering</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocalRole('tutor')}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                    localRole === 'tutor' ? 'border-sky-500 bg-sky-500/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span className="text-sm font-medium">I&apos;m a Tutor</span>
                  <span className="text-[10px] text-muted-foreground">Teach on MarqAI</span>
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remail">Email</Label>
                  <Input id="remail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rpass">Password</Label>
                  <Input id="rpass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {localRole === 'tutor' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="headline">Tutor headline</Label>
                    <Input
                      id="headline" placeholder="e.g. Senior React Engineer · 8 yrs"
                      value={tutorHeadline} onChange={(e) => setTutorHeadline(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Your application goes to the Super Admin for approval. You&apos;ll be able to complete your profile after approval.
                    </p>
                  </div>
                )}
                <Button type="submit" disabled={loading} className={`w-full ${
                  localRole === 'tutor'
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white hover:from-sky-600 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                }`}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {localRole === 'tutor' ? 'Apply to Teach' : 'Create account'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground">
                By registering you agree to MarqAI&apos;s Terms &amp; Privacy Policy.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickLogin({ icon: Icon, label, color, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center transition-colors hover:border-emerald-500/50 hover:bg-muted/40"
    >
      <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${color} text-white`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

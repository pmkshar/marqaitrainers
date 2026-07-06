'use client';

import { useState } from 'react';
import {
  ArrowLeft, ShieldCheck, Users, BookOpen, CreditCard, Plug, KeyRound, ScrollText,
  LayoutDashboard, Check, X, Trash2, Edit3, Save, Plus,
  UserCheck, AlertTriangle, Award, FileText, Mail, BarChart3, Lock,
  Building2, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { ALL_PERMISSIONS } from '@/lib/seed-data';
import { CourseIcon } from './navbar';
import {
  CertificateBuilderTab, RegistrationFormsTab, EmailSchedulingTab,
  AnalyticsTab, GdprTab,
} from './advanced-portal';
import type { AdminTab, RoleKey, PermissionKey, Role, User, Integration, CorporateAccount } from '@/lib/types';

const TABS: { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'pricing', label: 'Pricing', icon: CreditCard },
  { key: 'tutors', label: 'Tutors & Payments', icon: UserCheck },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'roles', label: 'Roles & Permissions', icon: KeyRound },
  { key: 'audit', label: 'Audit Log', icon: ScrollText },
  { key: 'corporate', label: 'Corporate', icon: Building2 },
  { key: 'certificate_builder', label: 'Certificate Builder', icon: Award },
  { key: 'registration_forms', label: 'Registration Forms', icon: FileText },
  { key: 'email_scheduling', label: 'Email Scheduling', icon: Mail },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'gdpr', label: 'GDPR', icon: Lock },
];

export function AdminPortal() {
  const store = useAppStore();
  const user = store.currentUser();
  const [activeTab, setActiveTab] = useState<AdminTab>(store.view.adminTab ?? 'dashboard');

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Super Admin access required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This area is restricted to Super Admins. Sign in with the admin account to continue.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => store.loginAs('u-admin-1')} className="bg-rose-600 text-white hover:bg-rose-700">
                Quick admin login
              </Button>
              <Button variant="outline" onClick={() => store.setAuthOpen(true, 'login')}>Sign in</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Pink/Rose Admin Header */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button onClick={store.goHome} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-xl font-bold text-white">M</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">MARQ AI Admin</h1>
                  <Badge className="border-white/30 bg-white/20 text-xs text-white">Super Admin</Badge>
                </div>
                <p className="mt-0.5 text-sm text-white/80">{user.email}</p>
                <p className="text-xs text-white/60">Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <Button className="border-white/30 bg-white/20 text-white hover:bg-white/30" onClick={() => store.openAdmin('dashboard')}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Admin Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Stats Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold">{store.users.filter((u) => u.role === 'candidate').length}</p>
                  <p className="text-xs text-muted-foreground">Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                  <UserCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold">{store.users.filter((u) => u.role === 'tutor').length}</p>
                  <p className="text-xs text-muted-foreground">Tutors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                  <Calendar2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold">{store.bookings.filter((b) => b.status === 'upcoming').length}</p>
                  <p className="text-xs text-muted-foreground">Live Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                  <Plug className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold">{store.integrations.filter((i) => i.connected).length}</p>
                  <p className="text-xs text-muted-foreground">Integrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid h-auto w-full grid-cols-4 lg:grid-cols-[repeat(14,minmax(0,1fr))]">
              {TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="flex flex-col gap-1 py-2 text-[11px] sm:flex-row sm:text-sm">
                  <t.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{t.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="courses"><CoursesTab /></TabsContent>
          <TabsContent value="pricing"><PricingTab /></TabsContent>
          <TabsContent value="tutors"><TutorsTab /></TabsContent>
          <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
          <TabsContent value="roles"><RolesTab /></TabsContent>
          <TabsContent value="audit"><AuditTab /></TabsContent>
          <TabsContent value="corporate"><CorporateTab /></TabsContent>
          <TabsContent value="certificate_builder"><CertificateBuilderTab /></TabsContent>
          <TabsContent value="registration_forms"><RegistrationFormsTab /></TabsContent>
          <TabsContent value="email_scheduling"><EmailSchedulingTab /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
          <TabsContent value="gdpr"><GdprTab /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

// ============================================================
// Dashboard
// ============================================================
function DashboardTab() {
  const { users, bookings, integrations, currentUser } = useAppStore();
  const candidates = users.filter((u) => u.role === 'candidate');
  const tutors = users.filter((u) => u.role === 'tutor');
  const pendingTutors = tutors.filter((t) => !t.tutorProfile?.approved);
  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const revenue = completedBookings.reduce((s, b) => s + b.price, 0);

  const dashboardCards = [
    { icon: Users, title: 'Users', subtitle: `${users.length} total · ${candidates.length} candidates`, color: 'from-emerald-500 to-teal-600', tab: 'users' as AdminTab },
    { icon: BookOpen, title: 'Courses', subtitle: `${COURSES.length} on-demand courses`, color: 'from-sky-500 to-cyan-600', tab: 'courses' as AdminTab },
    { icon: CreditCard, title: 'Pricing', subtitle: `$${revenue} revenue · ${completedBookings.length} completed`, color: 'from-amber-500 to-orange-600', tab: 'pricing' as AdminTab },
    { icon: UserCheck, title: 'Tutors', subtitle: `${tutors.filter((t) => t.tutorProfile?.approved).length} approved · ${pendingTutors.length} pending`, color: 'from-violet-500 to-purple-600', tab: 'tutors' as AdminTab },
    { icon: Plug, title: 'Integrations', subtitle: `${integrations.filter((i) => i.connected).length} of ${integrations.length} connected`, color: 'from-rose-500 to-pink-600', tab: 'integrations' as AdminTab },
    { icon: KeyRound, title: 'Roles & Permissions', subtitle: 'Full RBAC management', color: 'from-slate-500 to-slate-700', tab: 'roles' as AdminTab },
    { icon: ScrollText, title: 'Audit Log', subtitle: 'Platform activity trail', color: 'from-indigo-500 to-blue-600', tab: 'audit' as AdminTab },
    { icon: Zap, title: 'Features', subtitle: 'Toggle platform features', color: 'from-fuchsia-500 to-pink-600', tab: 'dashboard' as AdminTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome, {currentUser()?.name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground">Platform overview at a glance.</p>
      </div>

      {/* 8-card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <Card
            key={card.title}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => useAppStore.getState().openAdmin(card.tab)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                  <card.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{card.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{card.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingTutors.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-200">{pendingTutors.length} tutor application{pendingTutors.length !== 1 ? 's' : ''} need review</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">Approve or reject pending tutors in the Tutors &amp; Payments tab.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => useAppStore.getState().openAdmin('tutors')}>Review now</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between"><span>New candidate registered</span><span className="text-xs text-muted-foreground">2h ago</span></li>
              <li className="flex items-center justify-between"><span>Session completed by Aisha Patel</span><span className="text-xs text-muted-foreground">5h ago</span></li>
              <li className="flex items-center justify-between"><span>Subscription renewed (annual)</span><span className="text-xs text-muted-foreground">8h ago</span></li>
              <li className="flex items-center justify-between"><span>New tutor application: Marcus Lee</span><span className="text-xs text-muted-foreground">1d ago</span></li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Top courses by enrollment</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {COURSES.slice(0, 4).map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  <span className={`grid h-6 w-6 place-items-center rounded bg-gradient-to-br ${c.gradient} text-white`}>
                    <CourseIcon name={c.icon} className="h-3 w-3" />
                  </span>
                  <span className="flex-1 truncate">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{c.studentsCount} learners</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold">Integrations health</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {integrations.map((i) => (
              <div key={i.id} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                <span>{i.icon}</span>
                <span className="flex-1 truncate">{i.name}</span>
                <Badge variant="secondary" className={i.connected ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}>
                  {i.connected ? 'Connected' : 'Not connected'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Users
// ============================================================
function UsersTab() {
  const { users, setUserStatus, deleteUser, addUser, roles } = useAppStore();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'candidate' as RoleKey });

  const filtered = users.filter(
    (u) => (filter === 'all' || u.role === filter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) return;
    const colors = ['from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-sky-500 to-cyan-600', 'from-violet-500 to-purple-600'];
    addUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      enrolledCourseIds: [],
      status: 'active',
    });
    setNewUser({ name: '', email: '', role: 'candidate' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">{users.length} total users · CRUD + status control</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="mr-1 h-4 w-4" /> Add user
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="tutor">Human Tutor</SelectItem>
            <SelectItem value="candidate">Candidate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className={`bg-gradient-to-br ${u.avatarColor} text-white text-xs font-bold`}>{u.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={
                    u.role === 'super_admin' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' :
                    u.role === 'tutor' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' :
                    u.role === 'candidate' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                    'bg-muted'
                  }>{u.role === 'super_admin' ? 'Super Admin' : u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={
                    u.status === 'active' ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300' :
                    u.status === 'pending' ? 'border-amber-500/40 text-amber-700 dark:text-amber-300' :
                    'border-rose-500/40 text-rose-700 dark:text-rose-300'
                  }>{u.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {u.status === 'active' ? (
                      <Button size="sm" variant="ghost" onClick={() => setUserStatus(u.id, 'suspended')} title="Suspend">Suspend</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setUserStatus(u.id, 'active')} title="Activate">Activate</Button>
                    )}
                    {u.role !== 'super_admin' && (
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteUser(u.id); }} title="Delete" className="text-rose-600 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Card><CardContent className="p-5">
          <h3 className="text-sm font-semibold">Add new user</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div><Label>Name</Label><Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
            <div>
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as RoleKey })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.filter((r) => r.key !== 'guest').map((r) => (
                    <SelectItem key={r.key} value={r.key}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleAdd} className="bg-emerald-600 text-white hover:bg-emerald-700"><Save className="mr-1 h-4 w-4" /> Save</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}

// ============================================================
// Courses (admin view)
// ============================================================
function CoursesTab() {
  const { openCourse } = useAppStore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Course Catalog</h2>
        <p className="text-sm text-muted-foreground">{COURSES.length} on-demand courses · all available to subscribers</p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-center">Lessons</th>
              <th className="px-4 py-3 text-center">One-Time</th>
              <th className="px-4 py-3 text-center">Monthly</th>
              <th className="px-4 py-3 text-center">Annual</th>
              <th className="px-4 py-3 text-center">On-Demand</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {COURSES.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-8 w-8 place-items-center rounded bg-gradient-to-br ${c.gradient} text-white`}>
                      <CourseIcon name={c.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.instructor}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="secondary">{c.level}</Badge></td>
                <td className="px-4 py-3 text-center">{c.lessonsCount}</td>
                <td className="px-4 py-3 text-center font-medium">${c.oneTimePrice}</td>
                <td className="px-4 py-3 text-center">${c.monthlyPrice}</td>
                <td className="px-4 py-3 text-center">${c.annualPrice}</td>
                <td className="px-4 py-3 text-center">
                  {c.onDemand ? <Check className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <X className="mx-auto h-4 w-4 text-muted-foreground" />}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => openCourse(c.id)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="border-dashed">
        <CardContent className="p-5 text-sm text-muted-foreground">
          <p><Plus className="mr-1 inline h-4 w-4" /> Add new course — full CRUD available in production with course editor (lesson builder, video upload, quiz editor). This demo shows the read view.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Pricing
// ============================================================
function PricingTab() {
  const { integrations } = useAppStore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pricing &amp; Subscriptions</h2>
        <p className="text-sm text-muted-foreground">Manage subscription tiers and per-course prices.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly subscription</p>
          <p className="mt-1 text-3xl font-bold">$39<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground mt-1">All-access · cancel anytime</p>
          <Button size="sm" variant="outline" className="mt-3"><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit</Button>
        </CardContent></Card>
        <Card className="border-emerald-500/40 bg-emerald-500/5"><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Annual subscription</p>
          <p className="mt-1 text-3xl font-bold">$349<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">25% savings vs monthly</p>
          <Button size="sm" variant="outline" className="mt-3"><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit</Button>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Per-course (avg)</p>
          <p className="mt-1 text-3xl font-bold">$177<span className="text-sm font-normal text-muted-foreground"> lifetime</span></p>
          <p className="text-xs text-muted-foreground mt-1">Range: $159–$199</p>
          <Button size="sm" variant="outline" className="mt-3"><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit per-course</Button>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold">Per-course pricing</h3>
          <p className="text-xs text-muted-foreground">Adjust each course&apos;s one-time, monthly, and annual price.</p>
          <div className="mt-3 space-y-2">
            {COURSES.map((c) => (
              <div key={c.id} className="grid grid-cols-12 items-center gap-2 rounded-lg border p-2.5">
                <div className="col-span-12 sm:col-span-5 flex items-center gap-2">
                  <span className={`grid h-7 w-7 place-items-center rounded bg-gradient-to-br ${c.gradient} text-white`}>
                    <CourseIcon name={c.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium truncate">{c.title}</span>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Label className="text-[10px] text-muted-foreground sm:hidden">One-time</Label>
                  <Input defaultValue={c.oneTimePrice} type="number" className="h-8 text-sm" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Label className="text-[10px] text-muted-foreground sm:hidden">Monthly</Label>
                  <Input defaultValue={c.monthlyPrice} type="number" className="h-8 text-sm" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Label className="text-[10px] text-muted-foreground sm:hidden">Annual</Label>
                  <Input defaultValue={c.annualPrice} type="number" className="h-8 text-sm" />
                </div>
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                  <Button size="sm" variant="ghost"><Save className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold">Payment integration</h3>
          <p className="text-xs text-muted-foreground">Currently using Stripe for subscription billing.</p>
          <div className="mt-2 flex items-center gap-2 rounded-lg border p-3">
            <span className="text-xl">💳</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Stripe</p>
              <p className="text-xs text-muted-foreground">pk_live_•••••••• · webhook connected</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Connected</Badge>
            <Button size="sm" variant="outline" onClick={() => useAppStore.getState().openAdmin('integrations')}>Configure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Tutors & Payments
// ============================================================
function TutorsTab() {
  const { users, approveTutor, setTutorPayment } = useAppStore();
  const tutors = users.filter((u) => u.role === 'tutor');
  const pending = tutors.filter((t) => !t.tutorProfile?.approved);
  const approved = tutors.filter((t) => t.tutorProfile?.approved);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tutors &amp; Payments</h2>
        <p className="text-sm text-muted-foreground">{pending.length} pending · {approved.length} approved · set payout terms per tutor</p>
      </div>

      {pending.length > 0 && (
        <Card className="border-amber-500/40">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Pending applications</h3>
            <div className="mt-3 space-y-2">
              {pending.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className={`bg-gradient-to-br ${t.avatarColor} text-white font-bold`}>{t.name.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.tutorProfile?.headline} · applied {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" onClick={() => approveTutor(t.id)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50">
                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold">Approved tutors — payment terms</h3>
          <p className="text-xs text-muted-foreground">Set the platform commission % and payout schedule per tutor.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tutor</th>
                  <th className="px-3 py-2 text-center">Rate</th>
                  <th className="px-3 py-2 text-center">Rating</th>
                  <th className="px-3 py-2 text-center">Sessions</th>
                  <th className="px-3 py-2 text-center">Platform fee</th>
                  <th className="px-3 py-2 text-center">Payout</th>
                  <th className="px-3 py-2 text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {approved.map((t) => (
                  <TutorPaymentRow key={t.id} tutor={t} onSave={(patch) => setTutorPayment(t.id, patch)} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TutorPaymentRow({ tutor, onSave }: { tutor: User; onSave: (patch: { platformFeePct?: number; payoutSchedule?: 'weekly' | 'monthly' }) => void }) {
  const [fee, setFee] = useState(String(tutor.tutorProfile?.paymentTerms.platformFeePct ?? 20));
  const [schedule, setSchedule] = useState<'weekly' | 'monthly'>(tutor.tutorProfile?.paymentTerms.payoutSchedule ?? 'monthly');

  return (
    <tr>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7"><AvatarFallback className={`bg-gradient-to-br ${tutor.avatarColor} text-white text-[10px] font-bold`}>{tutor.name.charAt(0)}</AvatarFallback></Avatar>
          <div>
            <p className="text-sm font-medium">{tutor.name}</p>
            <p className="text-xs text-muted-foreground">${tutor.tutorProfile?.hourlyRate}/hr</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-center">${tutor.tutorProfile?.hourlyRate}</td>
      <td className="px-3 py-3 text-center">★ {tutor.tutorProfile?.rating}</td>
      <td className="px-3 py-3 text-center">{tutor.tutorProfile?.sessionsCompleted}</td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <Input type="number" min={0} max={50} value={fee} onChange={(e) => setFee(e.target.value)} className="h-8 w-16 text-center text-sm" />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <Select value={schedule} onValueChange={(v) => setSchedule(v as 'weekly' | 'monthly')}>
          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-3 text-right">
        <Button size="sm" variant="ghost" onClick={() => onSave({ platformFeePct: parseInt(fee, 10) || 0, payoutSchedule: schedule })}>
          <Save className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

// ============================================================
// Integrations
// ============================================================
function IntegrationsTab() {
  const { integrations, toggleIntegration } = useAppStore();
  const grouped = integrations.reduce((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i);
    return acc;
  }, {} as Record<string, Integration[]>);

  const categoryLabels: Record<string, string> = {
    payment: 'Payments', video: 'Video conferencing', calendar: 'Calendars',
    communication: 'Communication', analytics: 'Analytics', auth: 'Authentication', email: 'Email',
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          {integrations.filter((i) => i.connected).length} of {integrations.length} integrations connected · connect third-party tools
        </p>
      </div>
      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">{categoryLabels[cat] || cat}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {items.map((i) => (
                <div key={i.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <span className="text-2xl">{i.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{i.name}</p>
                      {i.connected && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{i.description}</p>
                    {i.connected && Object.keys(i.config).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.keys(i.config).map((k) => (
                          <Badge key={k} variant="outline" className="text-[9px] font-mono">{k}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Switch checked={i.connected} onCheckedChange={() => toggleIntegration(i.id)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// Roles & Permissions
// ============================================================
function RolesTab() {
  const { roles, toggleRolePermission, updateRole } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<RoleKey>('tutor');

  const grouped = ALL_PERMISSIONS.reduce((acc, p) => {
    (acc[p.group] = acc[p.group] || []).push(p);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);

  const role = roles.find((r) => r.key === selectedRole)!;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Roles &amp; Permissions</h2>
        <p className="text-sm text-muted-foreground">
          Full RBAC · toggle any permission for any role. Changes apply instantly to all users with that role.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardContent className="p-3">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roles</p>
            <div className="mt-1 space-y-1">
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRole(r.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedRole === r.key ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'hover:bg-muted'
                  }`}
                >
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.permissions.length} permissions</p>
                  </div>
                  {r.isSystem && <Badge variant="outline" className="text-[9px]">system</Badge>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
              <Badge variant="secondary">{role.permissions.length} permissions</Badge>
            </div>

            <div className="mt-5 space-y-4">
              {Object.entries(grouped).map(([group, perms]) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perms.map((p) => {
                      const has = role.permissions.includes(p.key);
                      return (
                        <label key={p.key} className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors ${
                          has ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'
                        }`}>
                          <Switch checked={has} onCheckedChange={() => toggleRolePermission(role.key, p.key)} />
                          <span className="flex-1">{p.label}</span>
                          <code className="text-[9px] text-muted-foreground">{p.key}</code>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Audit log
// ============================================================
function AuditTab() {
  const { auditLogs } = useAppStore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <p className="text-sm text-muted-foreground">{auditLogs.length} entries · most recent first</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.actorName}</span>{' '}
                    <span className="text-muted-foreground">{log.action.toLowerCase()}</span>
                    {log.target && <span className="font-medium"> · {log.target}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Corporate
// ============================================================
function CorporateTab() {
  const { corporates, approveCorporate, rejectCorporate } = useAppStore();
  const pending = corporates.filter((c) => c.status === 'pending');
  const approved = corporates.filter((c) => c.status === 'approved');
  const rejected = corporates.filter((c) => c.status === 'rejected');

  const statusBadge = (status: CorporateAccount['status']) => {
    const styles: Record<string, string> = {
      pending: 'border-amber-500/40 text-amber-700 dark:text-amber-300',
      approved: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
      rejected: 'border-rose-500/40 text-rose-700 dark:text-rose-300',
      suspended: 'border-slate-500/40 text-slate-700 dark:text-slate-300',
    };
    return (
      <Badge variant="outline" className={styles[status] ?? ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Corporate Management</h2>
        <p className="text-sm text-muted-foreground">{corporates.length} registered corporates · {pending.length} pending review</p>
      </div>

      {pending.length > 0 && (
        <Card className="border-amber-500/40">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Pending registrations</h3>
            <p className="text-xs text-muted-foreground">Review and approve or reject corporate registrations.</p>
            <div className="mt-3 space-y-3">
              {pending.map((corp) => (
                <div key={corp.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{corp.name}</p>
                      <p className="text-xs text-muted-foreground">{corp.industry} · {corp.country}</p>
                      <p className="text-xs text-muted-foreground">{corp.contactName} ({corp.contactEmail})</p>
                      <p className="text-xs text-muted-foreground">{corp.employeeCount} employees · {corp.plan} plan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" onClick={() => approveCorporate(corp.id)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50" onClick={() => rejectCorporate(corp.id)}>
                      <X className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {approved.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Approved corporates</h3>
            <div className="mt-3 overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Industry</th>
                    <th className="px-4 py-3 text-center">Employees</th>
                    <th className="px-4 py-3 text-center">Plan</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {approved.map((corp) => (
                    <tr key={corp.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                            <Building2 className="h-4 w-4" />
                          </span>
                          <span className="font-medium">{corp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{corp.industry}</td>
                      <td className="px-4 py-3 text-center">{corp.employeeCount}</td>
                      <td className="px-4 py-3 text-center capitalize">{corp.plan}</td>
                      <td className="px-4 py-3 text-muted-foreground">{corp.contactName}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(corp.status)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{new Date(corp.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {rejected.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground">Rejected corporates</h3>
            <div className="mt-3 space-y-2">
              {rejected.map((corp) => (
                <div key={corp.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded bg-muted text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{corp.name}</p>
                      <p className="text-xs text-muted-foreground">{corp.industry} · {corp.country}</p>
                    </div>
                  </div>
                  {statusBadge(corp.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {corporates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No corporate registrations yet</p>
            <p className="text-sm text-muted-foreground">Corporate accounts will appear here when they register.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Shared
// ============================================================
function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-white`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}{sub && ` · ${sub}`}</p>
      </CardContent>
    </Card>
  );
}

function Calendar2(props: { className?: string }) {
  // simple calendar icon
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}

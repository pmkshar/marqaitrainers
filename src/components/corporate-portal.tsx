'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useT } from '@/components/language-currency-switcher';
import {
  Building2, Users, Award, Filter, Download, Plus, CheckCircle2,
  Clock, XCircle, TrendingUp, Search, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { SkillLevel, CurrencyCode } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { COURSES } from '@/lib/courses';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  intermediate: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  advanced: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  expert: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

export function CorporatePortal() {
  const t = useT();
  const currentUser = useAppStore((s) => s.currentUser());
  const corporates = useAppStore((s) => s.corporates);
  const users = useAppStore((s) => s.users);
  const skillMatrix = useAppStore((s) => s.skillMatrix);
  const currency = useAppStore((s) => s.currency);
  const registerCorporate = useAppStore((s) => s.registerCorporate);
  const approveCorporate = useAppStore((s) => s.approveCorporate);
  const rejectCorporate = useAppStore((s) => s.rejectCorporate);
  const enrollCorporateEmployee = useAppStore((s) => s.enrollCorporateEmployee);
  const exportProfiles = useAppStore((s) => s.exportCorporateProfiles);

  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'dashboard' | 'skillmatrix'>('overview');

  // Detect corporate role
  const myCorporate = currentUser ? corporates.find((c) => c.adminUserId === currentUser.id || c.id === currentUser.corporateId) : null;
  const isCorpAdmin = currentUser?.role === 'corporate_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canSeeAdminActions = isSuperAdmin;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">{t('corporate.title')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('corporate.subtitle')}
            </p>
            <p className="mt-4 text-sm">Please sign in to access the corporate portal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">{t('corporate.title')}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t('corporate.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="register">{t('corporate.register')}</TabsTrigger>
          <TabsTrigger value="dashboard">{t('corporate.dashboard')}</TabsTrigger>
          <TabsTrigger value="skillmatrix">{t('corporate.skillMatrix')}</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={Building2}
              label="Total Corporates"
              value={corporates.length}
              color="from-indigo-500 to-purple-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved"
              value={corporates.filter((c) => c.status === 'approved').length}
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={Clock}
              label="Pending Approval"
              value={corporates.filter((c) => c.status === 'pending').length}
              color="from-amber-500 to-orange-600"
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Registered Corporates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {corporates.map((corp) => {
                  const empCount = corp.employeeUserIds.length;
                  const admin = users.find((u) => u.id === corp.adminUserId);
                  return (
                    <div
                      key={corp.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{corp.name}</h4>
                          <Badge variant={corp.status === 'approved' ? 'default' : corp.status === 'pending' ? 'secondary' : 'destructive'}>
                            {corp.status === 'approved' ? t('corporate.status.approved') : corp.status === 'pending' ? t('corporate.status.pending') : 'Rejected'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">{corp.planTier}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {corp.industry} · {corp.country} · {corp.domain}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Admin: {admin?.name ?? '—'} · {empCount} employee{empCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {canSeeAdminActions && corp.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveCorporate(corp.id)} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectCorporate(corp.id)}>
                            <XCircle className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Corporate Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <PlanCard tier="Starter" priceUSD={499} currency={currency} features={['Up to 25 employees', '3 courses access', 'Basic skill matrix', 'Email support']} />
                <PlanCard tier="Growth" priceUSD={1499} currency={currency} features={['Up to 100 employees', 'All courses access', 'Advanced analytics', 'Priority support', 'Custom certifications']} highlighted />
                <PlanCard tier="Enterprise" priceUSD={4999} currency={currency} features={['Unlimited employees', 'All courses + custom', 'Dedicated account manager', '24/7 support', 'SSO + audit logs', 'On-site workshops']} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTER */}
        <TabsContent value="register" className="mt-6">
          <CorporateRegistrationForm
            onSubmit={(form) => {
              const id = registerCorporate({
                name: form.name,
                domain: form.domain,
                industry: form.industry,
                country: form.country,
                contactEmail: form.contactEmail,
                contactName: form.contactName,
                adminUserId: currentUser.id,
                planTier: form.planTier,
              });
              void id;
              setActiveTab('overview');
            }}
          />
        </TabsContent>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="mt-6">
          {myCorporate ? (
            <CorporateDashboard
              corp={myCorporate}
              allUsers={users}
              skillMatrix={skillMatrix}
              onEnroll={(userId) => enrollCorporateEmployee(myCorporate.id, userId)}
              onExport={() => {
                const csv = exportProfiles(myCorporate.id);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${myCorporate.name.replace(/\s+/g, '_')}_profiles.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  You are not linked to a corporate account. Submit an application on the Register tab to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SKILL MATRIX */}
        <TabsContent value="skillmatrix" className="mt-6">
          <SkillMatrixDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${color} text-white`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanCard({ tier, priceUSD, currency, features, highlighted }: {
  tier: string;
  priceUSD: number;
  currency: CurrencyCode;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlighted ? 'border-emerald-500 bg-emerald-500/5' : ''}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold">{tier}</h4>
        {highlighted && <Badge className="bg-emerald-600">Popular</Badge>}
      </div>
      <p className="mt-2 text-2xl font-bold">{formatPrice(priceUSD, currency)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
      <ul className="mt-3 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RegFormState {
  name: string;
  domain: string;
  industry: string;
  country: string;
  contactName: string;
  contactEmail: string;
  planTier: 'starter' | 'growth' | 'enterprise';
}

function CorporateRegistrationForm({ onSubmit }: { onSubmit: (form: RegFormState) => void }) {
  const t = useT();
  const [form, setForm] = useState<RegFormState>({
    name: '',
    domain: '',
    industry: 'Software',
    country: 'US',
    contactName: '',
    contactEmail: '',
    planTier: 'growth',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('corporate.register')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="corp-name">{t('corporate.companyName')} *</Label>
            <Input id="corp-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Technologies Inc." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corp-domain">{t('corporate.domain')} *</Label>
            <Input id="corp-domain" required value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="acme.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corp-industry">{t('corporate.industry')}</Label>
            <Input id="corp-industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Software / FinTech / Healthcare" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corp-country">{t('corporate.country')}</Label>
            <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
              <SelectTrigger id="corp-country"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="ES">Spain</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corp-contact-name">{t('corporate.contactName')} *</Label>
            <Input id="corp-contact-name" required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Sarah Chen" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corp-contact-email">{t('corporate.contactEmail')} *</Label>
            <Input id="corp-contact-email" type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="hr@acme.com" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="corp-plan">{t('corporate.planTier')}</Label>
            <Select value={form.planTier} onValueChange={(v) => setForm({ ...form, planTier: v as RegFormState['planTier'] })}>
              <SelectTrigger id="corp-plan"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter — up to 25 employees</SelectItem>
                <SelectItem value="growth">Growth — up to 100 employees (Most Popular)</SelectItem>
                <SelectItem value="enterprise">Enterprise — unlimited employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700">
              {t('corporate.apply')}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Your application will be reviewed by our Super Admin. You will be notified once approved.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CorporateDashboard({ corp, allUsers, skillMatrix, onEnroll, onExport }: {
  corp: ReturnType<typeof useAppStore.getState>['corporates'][number];
  allUsers: ReturnType<typeof useAppStore.getState>['users'];
  skillMatrix: ReturnType<typeof useAppStore.getState>['skillMatrix'];
  onEnroll: (userId: string) => void;
  onExport: () => void;
}) {
  const t = useT();
  const [search, setSearch] = useState('');

  const employees = allUsers.filter((u) => corp.employeeUserIds.includes(u.id));
  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const nonEmployees = allUsers.filter((u) =>
    !corp.employeeUserIds.includes(u.id) &&
    u.role === 'candidate' &&
    u.status === 'active'
  );

  // Skills progress stats
  const skillStats = useMemo(() => {
    const corpSkills = skillMatrix.filter((s) => corp.employeeUserIds.includes(s.userId));
    const byLevel: Record<SkillLevel, number> = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    let certifiedCount = 0;
    let totalScore = 0;
    corpSkills.forEach((s) => {
      byLevel[s.level]++;
      if (s.certified) certifiedCount++;
      totalScore += s.scorePct;
    });
    return {
      total: corpSkills.length,
      byLevel,
      certified: certifiedCount,
      avgScore: corpSkills.length > 0 ? Math.round(totalScore / corpSkills.length) : 0,
    };
  }, [skillMatrix, corp.employeeUserIds]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Employees" value={employees.length} color="from-emerald-500 to-teal-600" />
        <StatCard icon={Award} label="Certified Skills" value={skillStats.certified} color="from-violet-500 to-purple-600" />
        <StatCard icon={TrendingUp} label="Avg Score" value={skillStats.avgScore} color="from-amber-500 to-orange-600" />
        <StatCard icon={CheckCircle2} label="Skills Tracked" value={skillStats.total} color="from-sky-500 to-cyan-600" />
      </div>

      {/* Skill distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map((level) => (
              <div key={level} className="rounded-lg border p-3">
                <Badge className={`${LEVEL_COLORS[level]} capitalize`}>{t(`corporate.skillLevel.${level}`)}</Badge>
                <p className="mt-2 text-2xl font-bold">{skillStats.byLevel[level]}</p>
                <p className="text-xs text-muted-foreground">employees</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('corporate.employees')} ({employees.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-1 h-4 w-4" /> {t('corporate.exportProfiles')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('corporate.noEmployees')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-3">Employee</th>
                    <th className="pb-2 pr-3">Email</th>
                    <th className="pb-2 pr-3">Courses</th>
                    <th className="pb-2 pr-3">Skills Tracked</th>
                    <th className="pb-2 pr-3">Certified</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => {
                    const skills = skillMatrix.filter((s) => s.userId === emp.id);
                    const certCount = skills.filter((s) => s.certified).length;
                    return (
                      <tr key={emp.id} className="border-b last:border-0">
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <span className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${emp.avatarColor} text-xs font-semibold text-white`}>
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                            <span className="font-medium">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{emp.email}</td>
                        <td className="py-2 pr-3">{emp.enrolledCourseIds.length}</td>
                        <td className="py-2 pr-3">{skills.length}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={certCount > 0 ? 'default' : 'secondary'}>{certCount}</Badge>
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

      {/* Enroll employees */}
      {nonEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> {t('corporate.enroll')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {nonEmployees.slice(0, 10).map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onEnroll(u.id)}>
                    Enroll <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SkillMatrixDashboard() {
  const t = useT();
  const corporates = useAppStore((s) => s.corporates);
  const users = useAppStore((s) => s.users);
  const skillMatrix = useAppStore((s) => s.skillMatrix);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCorp, setFilterCorp] = useState<string>('all');

  // Build filtered rows: rows = employees, columns = courses
  const filteredCorps = filterCorp === 'all' ? corporates : corporates.filter((c) => c.id === filterCorp);
  const employeeIds = filteredCorps.flatMap((c) => c.employeeUserIds);
  const employees = users.filter((u) => employeeIds.includes(u.id));

  const courseIds = useMemo(() => {
    const ids = new Set<string>();
    skillMatrix.forEach((s) => { if (employeeIds.includes(s.userId)) ids.add(s.courseId); });
    return Array.from(ids);
  }, [skillMatrix, employeeIds]);

  const visibleCourseIds = filterCourse === 'all' ? courseIds : [filterCourse];

  const getSkill = (userId: string, courseId: string) =>
    skillMatrix.find((s) => s.userId === userId && s.courseId === courseId);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('common.filter')}:</span>
            </div>
            <Select value={filterCorp} onValueChange={setFilterCorp}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Corporate" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Corporates</SelectItem>
                {corporates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-44"><SelectValue placeholder={t('corporate.filterBySkill')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courseIds.map((cid) => {
                  const c = COURSES.find((x) => x.id === cid);
                  return <SelectItem key={cid} value={cid}>{c?.title ?? cid}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-44"><SelectValue placeholder={t('corporate.filterByLevel')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">{t('corporate.skillLevel.beginner')}</SelectItem>
                <SelectItem value="intermediate">{t('corporate.skillLevel.intermediate')}</SelectItem>
                <SelectItem value="advanced">{t('corporate.skillLevel.advanced')}</SelectItem>
                <SelectItem value="expert">{t('corporate.skillLevel.expert')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>{t('corporate.skillMatrix')}</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No employees to display.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-3 sticky left-0 bg-card">Employee</th>
                    <th className="pb-2 pr-3">Corporate</th>
                    {visibleCourseIds.map((cid) => {
                      const c = COURSES.find((x) => x.id === cid);
                      return <th key={cid} className="pb-2 pr-3 text-center">{c?.title?.split(' ').slice(0, 2).join(' ') ?? cid}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const corp = corporates.find((c) => c.id === emp.corporateId);
                    return (
                      <tr key={emp.id} className="border-b last:border-0">
                        <td className="py-2 pr-3 sticky left-0 bg-card">
                          <div className="flex items-center gap-2">
                            <span className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${emp.avatarColor} text-[10px] font-semibold text-white`}>
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{corp?.name ?? '—'}</td>
                        {visibleCourseIds.map((cid) => {
                          const skill = getSkill(emp.id, cid);
                          if (!skill) return <td key={cid} className="py-2 pr-3 text-center text-muted-foreground">—</td>;
                          if (filterLevel !== 'all' && skill.level !== filterLevel) {
                            return <td key={cid} className="py-2 pr-3 text-center text-muted-foreground opacity-30">—</td>;
                          }
                          return (
                            <td key={cid} className="py-2 pr-3 text-center">
                              <div className="inline-flex flex-col items-center gap-0.5">
                                <Badge className={`${LEVEL_COLORS[skill.level]} text-[10px] px-1.5 py-0`}>
                                  {skill.level.slice(0, 4)}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{skill.scorePct}%</span>
                                {skill.certified && <Award className="h-3 w-3 text-amber-500" />}
                              </div>
                            </td>
                          );
                        })}
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

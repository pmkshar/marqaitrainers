'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useT } from '@/components/language-currency-switcher';
import {
  Building2, Users, Award, Filter, Download, Plus, CheckCircle2,
  Clock, XCircle, TrendingUp, Search, ChevronRight,
  CreditCard, BookOpen, BarChart3, FileText, Shield,
  MessageSquare, Settings, Eye, Trash2, Star,
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
import type { SkillLevel, CurrencyCode, CorporatePlanModel, User } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { COURSES, findCourse } from '@/lib/courses';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  intermediate: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  advanced: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  expert: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

function useCurrentUser(): User | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

export function CorporatePortal() {
  const t = useT();
  const currentUser = useCurrentUser();
  const corporates = useAppStore((s) => s.corporates);
  const users = useAppStore((s) => s.users);
  const skillMatrix = useAppStore((s) => s.skillMatrix);
  const aiInterviewReports = useAppStore((s) => s.aiInterviewReports);
  const certificates = useAppStore((s) => s.certificates);
  const currency = useAppStore((s) => s.currency);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">Corporate Portal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access corporate training, employee management, and subscription plans.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCorpAdmin = currentUser.role === 'corporate_admin';
  const isCorpUser = currentUser.role === 'corporate_user';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const myCorporate = currentUser.corporateId
    ? corporates.find((c) => c.id === currentUser.corporateId)
    : null;

  // Corporate employee view - restricted course access
  if (isCorpUser && myCorporate) {
    return <CorporateEmployeeDashboard corp={myCorporate} user={currentUser} allUsers={users} skillMatrix={skillMatrix} aiInterviewReports={aiInterviewReports} certificates={certificates} />;
  }

  // Corporate admin dashboard
  if (isCorpAdmin && myCorporate) {
    return (
      <CorporateAdminDashboard
        corp={myCorporate}
        allUsers={users}
        skillMatrix={skillMatrix}
        aiInterviewReports={aiInterviewReports}
        certificates={certificates}
        currency={currency}
      />
    );
  }

  // Super admin or unlinked user — show overview + register
  return <CorporateOverview corporates={corporates} users={users} skillMatrix={skillMatrix} currentUser={currentUser} currency={currency} isSuperAdmin={isSuperAdmin} />;
}

// ============================================================
// Corporate Employee Dashboard
// ============================================================
function CorporateEmployeeDashboard({ corp, user, allUsers, skillMatrix, aiInterviewReports, certificates }: {
  corp: ReturnType<typeof useAppStore.getState>['corporates'][number];
  user: ReturnType<typeof useAppStore.getState>['currentUser'] extends () => infer U | null ? NonNullable<U> : never;
  allUsers: ReturnType<typeof useAppStore.getState>['users'];
  skillMatrix: ReturnType<typeof useAppStore.getState>['skillMatrix'];
  aiInterviewReports: ReturnType<typeof useAppStore.getState>['aiInterviewReports'];
  certificates: ReturnType<typeof useAppStore.getState>['certificates'];
}) {
  const openCourse = useAppStore((s) => s.openCourse);
  const [tab, setTab] = useState<'courses' | 'skills' | 'reports' | 'certs'>('courses');

  // Only show courses approved by admin
  const accessibleCourses = COURSES.filter((c) =>
    corp.employeeRestrictedCourseIds.includes(c.id) || user.approvedCourseIds.includes(c.id)
  );

  const mySkills = skillMatrix.filter((s) => s.userId === user.id);
  const myReports = aiInterviewReports.filter((r) => r.userId === user.id);
  const myCerts = certificates.filter((c) => c.userId === user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Building2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{corp.name} — Employee Portal</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user.name}. Access your approved courses and track your progress.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="courses"><BookOpen className="mr-1.5 h-4 w-4" /> My Courses</TabsTrigger>
          <TabsTrigger value="skills"><BarChart3 className="mr-1.5 h-4 w-4" /> Skills</TabsTrigger>
          <TabsTrigger value="reports"><MessageSquare className="mr-1.5 h-4 w-4" /> AI Reports</TabsTrigger>
          <TabsTrigger value="certs"><Award className="mr-1.5 h-4 w-4" /> Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {accessibleCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No courses have been approved for you yet. Contact your corporate admin.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accessibleCourses.map((course) => {
                const skill = mySkills.find((s) => s.courseId === course.id);
                return (
                  <Card key={course.id} className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg" onClick={() => openCourse(course.id)}>
                    <div className={`h-24 bg-gradient-to-br ${course.gradient}`}>
                      <Badge className="ml-3 mt-3 bg-white/20 text-white">{course.level}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{course.subtitle}</p>
                      {skill && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge className={`${LEVEL_COLORS[skill.level]} text-[10px]`}>{skill.level}</Badge>
                          <span className="text-xs text-muted-foreground">{skill.scorePct}%</span>
                        </div>
                      )}
                      <Button size="sm" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Continue Learning
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          {mySkills.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-sm text-muted-foreground">No skill assessments yet.</p></CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {mySkills.map((s) => {
                const course = findCourse(s.courseId);
                return (
                  <Card key={s.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <span className={`grid h-12 w-12 place-items-center rounded-xl ${s.certified ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-muted'} text-white`}>
                        {s.certified ? <Star className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{course?.title ?? s.courseId}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge className={`${LEVEL_COLORS[s.level]} text-[10px]`}>{s.level}</Badge>
                          <span className="text-xs text-muted-foreground">{s.scorePct}%</span>
                          {s.certified && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Certified</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          {myReports.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-sm text-muted-foreground">No AI interview reports yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {myReports.map((r) => {
                const course = findCourse(r.courseId);
                return (
                  <Card key={r.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{course?.title ?? r.courseId}</h4>
                        <Badge variant="outline">{new Date(r.completedAt).toLocaleDateString()}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                      <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                        <ScoreBlock label="Overall" score={r.overallScore} />
                        <ScoreBlock label="Technical" score={r.technicalScore} />
                        <ScoreBlock label="Communication" score={r.communicationScore} />
                        <ScoreBlock label="Problem Solving" score={r.problemSolvingScore} />
                      </div>
                      <div className="mt-3 flex gap-6">
                        <div>
                          <p className="text-xs font-medium text-emerald-600">Strengths</p>
                          <ul className="mt-1 space-y-0.5">{r.strengths.map((s) => <li key={s} className="text-xs text-muted-foreground">+ {s}</li>)}</ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-amber-600">Improvements</p>
                          <ul className="mt-1 space-y-0.5">{r.improvements.map((s) => <li key={s} className="text-xs text-muted-foreground">- {s}</li>)}</ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certs" className="mt-6">
          {myCerts.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-sm text-muted-foreground">No certificates earned yet.</p></CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myCerts.map((c) => {
                const course = findCourse(c.courseId);
                return (
                  <Card key={c.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        <Award className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-medium">{course?.title ?? c.courseId}</p>
                        <p className="text-xs text-muted-foreground">Score: {c.scorePct}% · Code: {c.code}</p>
                        <Badge variant="outline" className="mt-1">{c.template}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScoreBlock({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
  return (
    <div>
      <p className={`text-lg font-bold ${color}`}>{score}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ============================================================
// Corporate Admin Dashboard
// ============================================================
function CorporateAdminDashboard({ corp, allUsers, skillMatrix, aiInterviewReports, certificates, currency }: {
  corp: ReturnType<typeof useAppStore.getState>['corporates'][number];
  allUsers: ReturnType<typeof useAppStore.getState>['users'];
  skillMatrix: ReturnType<typeof useAppStore.getState>['skillMatrix'];
  aiInterviewReports: ReturnType<typeof useAppStore.getState>['aiInterviewReports'];
  certificates: ReturnType<typeof useAppStore.getState>['certificates'];
  currency: CurrencyCode;
}) {
  const addCorporateSubscription = useAppStore((s) => s.addCorporateSubscription);
  const cancelCorporateSubscription = useAppStore((s) => s.cancelCorporateSubscription);
  const registerCorporateEmployee = useAppStore((s) => s.registerCorporateEmployee);
  const approveEmployeeCourse = useAppStore((s) => s.approveEmployeeCourse);
  const removeCorporateEmployee = useAppStore((s) => s.removeCorporateEmployee);
  const exportCorporateProfiles = useAppStore((s) => s.exportCorporateProfiles);
  const [tab, setTab] = useState<'overview' | 'employees' | 'subscriptions' | 'reports' | 'certs'>('overview');

  const employees = allUsers.filter((u) => corp.employeeUserIds.includes(u.id));
  const activeSubs = corp.subscriptions.filter((s) => s.status === 'active');
  const corpReports = aiInterviewReports.filter((r) => r.corporateId === corp.id);
  const corpCerts = certificates.filter((c) => corp.employeeUserIds.includes(c.userId));

  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');

  const handleAddEmployee = () => {
    if (!newEmpName.trim() || !newEmpEmail.trim()) return;
    registerCorporateEmployee(corp.id, newEmpName, newEmpEmail);
    setNewEmpName('');
    setNewEmpEmail('');
  };

  const handleDownloadCourseMaterial = (courseId: string) => {
    const course = findCourse(courseId);
    if (!course) return;
    let content = `${course.title}\n${'='.repeat(course.title.length)}\n\n`;
    content += `Subtitle: ${course.subtitle}\n`;
    content += `Level: ${course.level}\n`;
    content += `Duration: ${course.duration}\n`;
    content += `Instructor: ${course.instructor}\n\n`;
    content += `DESCRIPTION\n${'-'.repeat(11)}\n${course.longDescription}\n\n`;
    course.modules.forEach((mod) => {
      content += `\nMODULE: ${mod.title}\n${mod.description}\n\n`;
      mod.lessons.forEach((lesson) => {
        content += `  Lesson: ${lesson.title}\n  Duration: ${lesson.duration}\n`;
        lesson.steps.forEach((step, i) => {
          content += `\n  Step ${i + 1}: ${step.title}\n  ${step.content}\n`;
          if (step.code) content += `\n  Code:\n  ${step.code.split('\n').join('\n  ')}\n`;
          if (step.tip) content += `\n  Tip: ${step.tip}\n`;
        });
        if (lesson.quiz.length > 0) {
          content += `\n  Quiz:\n`;
          lesson.quiz.forEach((q, i) => {
            content += `  Q${i + 1}: ${q.question}\n`;
            q.options.forEach((o, j) => content += `    ${j + 1}. ${o}${j === q.correctAnswer ? ' (Correct)' : ''}\n`);
            content += `  Explanation: ${q.explanation}\n`;
          });
        }
        content += '\n';
      });
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '_')}_Material.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProfiles = () => {
    const csv = exportCorporateProfiles(corp.id);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${corp.name.replace(/\s+/g, '_')}_profiles.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Building2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{corp.name} — Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage employees, subscriptions, and track progress.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><BarChart3 className="mr-1.5 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="employees"><Users className="mr-1.5 h-4 w-4" /> Employees</TabsTrigger>
          <TabsTrigger value="subscriptions"><CreditCard className="mr-1.5 h-4 w-4" /> Subscriptions</TabsTrigger>
          <TabsTrigger value="reports"><MessageSquare className="mr-1.5 h-4 w-4" /> AI Reports</TabsTrigger>
          <TabsTrigger value="certs"><Award className="mr-1.5 h-4 w-4" /> Certificates</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icon={Users} label="Employees" value={employees.length} color="from-emerald-500 to-teal-600" />
            <StatCard icon={CreditCard} label="Active Plans" value={activeSubs.length} color="from-indigo-500 to-purple-600" />
            <StatCard icon={Award} label="Certificates" value={corpCerts.length} color="from-amber-500 to-orange-600" />
            <StatCard icon={MessageSquare} label="AI Reports" value={corpReports.length} color="from-sky-500 to-cyan-600" />
          </div>

          {/* Subscribed courses with download */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Subscribed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {corp.subscribedCourseIds.map((cid) => {
                  const course = findCourse(cid);
                  if (!course) return null;
                  return (
                    <div key={cid} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.level} · {course.duration}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadCourseMaterial(cid)}>
                        <Download className="mr-1 h-3.5 w-3.5" /> Material
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMPLOYEES */}
        <TabsContent value="employees" className="mt-6">
          {/* Add employee */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label>Name</Label>
                  <Input placeholder="Employee name" value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="employee@company.com" value={newEmpEmail} onChange={(e) => setNewEmpEmail(e.target.value)} />
                </div>
                <Button onClick={handleAddEmployee} disabled={!newEmpName.trim() || !newEmpEmail.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Employee list with course approval */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employees ({employees.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportProfiles}>
                  <Download className="mr-1 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No employees yet.</p>
              ) : (
                <div className="space-y-4">
                  {employees.map((emp) => {
                    const empSkills = skillMatrix.filter((s) => s.userId === emp.id);
                    const empCerts = empSkills.filter((s) => s.certified).length;
                    return (
                      <div key={emp.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${emp.avatarColor} text-sm font-bold text-white`}>
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.email} · {empSkills.length} skills · {empCerts} certified</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => removeCorporateEmployee(corp.id, emp.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Course approval checkboxes */}
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Approved Courses:</p>
                          <div className="flex flex-wrap gap-2">
                            {corp.subscribedCourseIds.map((cid) => {
                              const course = findCourse(cid);
                              const isApproved = emp.approvedCourseIds.includes(cid);
                              return (
                                <button
                                  key={cid}
                                  onClick={() => approveEmployeeCourse(corp.id, emp.id, cid)}
                                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                                    isApproved
                                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                      : 'border-border hover:border-emerald-500/50 text-muted-foreground'
                                  }`}
                                >
                                  {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border" />}
                                  {course?.title?.split(' ').slice(0, 3).join(' ') ?? cid}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTIONS */}
        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionManager corp={corp} currency={currency} />
        </TabsContent>

        {/* AI REPORTS */}
        <TabsContent value="reports" className="mt-6">
          {corpReports.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-sm text-muted-foreground">No AI interview reports yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {corpReports.map((r) => {
                const emp = allUsers.find((u) => u.id === r.userId);
                const course = findCourse(r.courseId);
                return (
                  <Card key={r.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {emp && (
                            <span className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${emp.avatarColor} text-xs font-bold text-white`}>
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                          )}
                          <div>
                            <p className="font-medium">{emp?.name ?? r.userId}</p>
                            <p className="text-xs text-muted-foreground">{course?.title ?? r.courseId}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{new Date(r.completedAt).toLocaleDateString()}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                      <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                        <ScoreBlock label="Overall" score={r.overallScore} />
                        <ScoreBlock label="Technical" score={r.technicalScore} />
                        <ScoreBlock label="Communication" score={r.communicationScore} />
                        <ScoreBlock label="Problem Solving" score={r.problemSolvingScore} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CERTIFICATES */}
        <TabsContent value="certs" className="mt-6">
          {corpCerts.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><p className="text-sm text-muted-foreground">No certificates earned by employees yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {corpCerts.map((c) => {
                const emp = allUsers.find((u) => u.id === c.userId);
                const course = findCourse(c.courseId);
                return (
                  <Card key={c.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        <Award className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{emp?.name ?? c.userId}</p>
                        <p className="text-xs text-muted-foreground">{course?.title ?? c.courseId} · Score: {c.scorePct}%</p>
                      </div>
                      <Badge variant="outline">Code: {c.code}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Subscription Manager
// ============================================================
function SubscriptionManager({ corp, currency }: { corp: ReturnType<typeof useAppStore.getState>['corporates'][number]; currency: CurrencyCode }) {
  const addCorporateSubscription = useAppStore((s) => s.addCorporateSubscription);
  const cancelCorporateSubscription = useAppStore((s) => s.cancelCorporateSubscription);
  const [planModel, setPlanModel] = useState<CorporatePlanModel>('monthly');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const toggleCourse = (cid: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  const pricePerSeat = planModel === 'annual' ? 1999 : planModel === 'monthly' ? 499 : 299;
  const employeeLimit = planModel === 'annual' ? 200 : planModel === 'monthly' ? 50 : 10;

  const handleSubscribe = () => {
    const courseIds = selectedCourseIds.length > 0 ? selectedCourseIds : COURSES.map((c) => c.id);
    addCorporateSubscription(corp.id, planModel, courseIds, pricePerSeat, employeeLimit);
    setSelectedCourseIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Current subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {corp.subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
          ) : (
            <div className="space-y-3">
              {corp.subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                        {sub.status}
                      </Badge>
                      <span className="font-medium capitalize">{sub.planModel.replace('_', ' ')}</span>
                      <Badge variant="outline">{sub.planTier}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sub.courseIds.length} course{sub.courseIds.length !== 1 ? 's' : ''} · {sub.employeeLimit} seats · {formatPrice(sub.pricePerSeat, currency)}/seat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(sub.startedAt).toLocaleDateString()} · Expires: {new Date(sub.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  {sub.status === 'active' && (
                    <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50" onClick={() => cancelCorporateSubscription(corp.id, sub.id)}>
                      <XCircle className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add new subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> New Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Plan Model</Label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {([
                { value: 'single_course' as const, label: 'Single Course', price: 299, seats: 10 },
                { value: 'monthly' as const, label: 'Monthly', price: 499, seats: 50 },
                { value: 'annual' as const, label: 'Annual', price: 1999, seats: 200 },
              ]).map((plan) => (
                <button
                  key={plan.value}
                  onClick={() => setPlanModel(plan.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    planModel === plan.value ? 'border-emerald-500 bg-emerald-500/5' : 'hover:border-emerald-500/30'
                  }`}
                >
                  <p className="font-medium">{plan.label}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(plan.price, currency)}/seat · {plan.seats} seats</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Select Courses {selectedCourseIds.length === 0 && <span className="text-muted-foreground">(none = all-access)</span>}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COURSES.map((course) => {
                const selected = selectedCourseIds.includes(course.id);
                return (
                  <button
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      selected ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700' : 'hover:border-emerald-500/30 text-muted-foreground'
                    }`}
                  >
                    {selected ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border" />}
                    {course.title.split(' ').slice(0, 2).join(' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleSubscribe} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700">
            <CreditCard className="mr-2 h-4 w-4" /> Subscribe — {formatPrice(pricePerSeat, currency)}/seat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Corporate Overview (Super Admin / Unlinked User)
// ============================================================
function CorporateOverview({ corporates, users, skillMatrix, currentUser, currency, isSuperAdmin }: {
  corporates: ReturnType<typeof useAppStore.getState>['corporates'];
  users: ReturnType<typeof useAppStore.getState>['users'];
  skillMatrix: ReturnType<typeof useAppStore.getState>['skillMatrix'];
  currentUser: ReturnType<typeof useAppStore.getState>['currentUser'] extends () => infer U | null ? NonNullable<U> : never;
  currency: CurrencyCode;
  isSuperAdmin: boolean;
}) {
  const registerCorporate = useAppStore((s) => s.registerCorporate);
  const approveCorporate = useAppStore((s) => s.approveCorporate);
  const rejectCorporate = useAppStore((s) => s.rejectCorporate);
  const [activeTab, setActiveTab] = useState<'overview' | 'register'>('overview');
  const [form, setForm] = useState({
    name: '', domain: '', industry: 'Software', country: 'IN',
    contactName: '', contactEmail: '', planTier: 'growth' as 'starter' | 'growth' | 'enterprise',
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerCorporate({
      name: form.name,
      domain: form.domain,
      industry: form.industry,
      country: form.country,
      contactEmail: form.contactEmail,
      contactName: form.contactName,
      adminUserId: currentUser.id,
      planTier: form.planTier,
    });
    setActiveTab('overview');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Corporate Portal</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Corporate training solutions for businesses of all sizes.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="register">Register Company</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Building2} label="Total Corporates" value={corporates.length} color="from-indigo-500 to-purple-600" />
            <StatCard icon={CheckCircle2} label="Approved" value={corporates.filter((c) => c.status === 'approved').length} color="from-emerald-500 to-teal-600" />
            <StatCard icon={Clock} label="Pending Approval" value={corporates.filter((c) => c.status === 'pending').length} color="from-amber-500 to-orange-600" />
          </div>

          {/* Plans */}
          <Card className="mt-6">
            <CardHeader><CardTitle>Corporate Plans</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <PlanCard tier="Starter" priceUSD={499} currency={currency} features={['Up to 25 employees', '3 courses access', 'Basic skill matrix', 'Email support']} />
                <PlanCard tier="Growth" priceUSD={1499} currency={currency} features={['Up to 100 employees', 'All courses access', 'Advanced analytics', 'Priority support', 'Custom certifications']} highlighted />
                <PlanCard tier="Enterprise" priceUSD={4999} currency={currency} features={['Unlimited employees', 'All courses + custom', 'Dedicated account manager', '24/7 support', 'SSO + audit logs', 'On-site workshops']} />
              </div>
            </CardContent>
          </Card>

          {/* Corporate list */}
          {corporates.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Registered Corporates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {corporates.map((corp) => {
                    const empCount = corp.employeeUserIds.length;
                    const admin = users.find((u) => u.id === corp.adminUserId);
                    return (
                      <div key={corp.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{corp.name}</h4>
                            <Badge variant={corp.status === 'approved' ? 'default' : corp.status === 'pending' ? 'secondary' : 'destructive'}>
                              {corp.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">{corp.planTier}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{corp.industry} · {corp.country} · {corp.domain}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Admin: {admin?.name ?? '—'} · {empCount} employee{empCount !== 1 ? 's' : ''}</p>
                        </div>
                        {isSuperAdmin && corp.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveCorporate(corp.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
          )}
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Register Your Company</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Company Name *</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Technologies Inc." />
                </div>
                <div className="space-y-1.5">
                  <Label>Domain *</Label>
                  <Input required value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="acme.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Software / FinTech / Healthcare" />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Name *</Label>
                  <Input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Sarah Chen" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Email *</Label>
                  <Input type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="hr@acme.com" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Plan Tier</Label>
                  <Select value={form.planTier} onValueChange={(v) => setForm({ ...form, planTier: v as typeof form.planTier })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter — up to 25 employees</SelectItem>
                      <SelectItem value="growth">Growth — up to 100 employees (Most Popular)</SelectItem>
                      <SelectItem value="enterprise">Enterprise — unlimited employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700">
                    Apply for Corporate Account
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Your application will be reviewed by our Super Admin. You will be notified once approved.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Shared sub-components
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

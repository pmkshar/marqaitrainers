'use client';

import { useState } from 'react';
import {
  Award, FileText, Mail, BarChart3, Lock,
  Plus, Trash2, RefreshCw, Download, TrendingUp,
  Users, DollarSign, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import type {
  CertificateElement, CertificateElementType,
  RegistrationFieldKind, EmailScheduleKind,
} from '@/lib/types';

// ============================================================
// Certificate Builder — drag-drop canvas editor
// ============================================================

export function CertificateBuilderTab() {
  const store = useAppStore();
  const templates = store.certTemplates;
  const [selectedTplId, setSelectedTplId] = useState(templates[0]?.id ?? '');
  const [selectedElId, setSelectedElId] = useState<string | null>(null);

  const tpl = templates.find((t) => t.id === selectedTplId) ?? templates[0];
  const selectedEl = tpl?.elements.find((e) => e.id === selectedElId) ?? null;

  if (!tpl) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">No templates yet.</CardContent></Card>;
  }

  function addElement(type: CertificateElementType) {
    const newEl: Omit<CertificateElement, 'id'> = {
      type, x: 50, y: 50, w: 60, fontSize: 18, fontWeight: 500,
      color: '#1e293b', text: type === 'static_text' ? 'New text' : `{{${type}}}`, align: 'center',
    };
    store.addCertElement(tpl!.id, newEl);
  }

  function renderElementText(el: CertificateElement) {
    if (el.type === 'static_text' || el.type === 'signature' || el.type === 'logo') return el.text ?? '';
    if (el.type === 'title') return 'Certificate of Completion';
    if (el.type === 'subtitle') return 'This certifies that';
    if (el.type === 'recipient_name') return 'Aarav Sharma';
    if (el.type === 'course_name') return 'AI & Machine Learning Bootcamp';
    if (el.type === 'score') return 'Final score: 92%';
    if (el.type === 'date') return 'Issued: Jun 21, 2026';
    if (el.type === 'code') return 'Code: MARQ-2026-A1B2C3';
    return '';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Certificate Builder</h3>
          <p className="text-sm text-muted-foreground">Drag-drop canvas to design certificate templates. Templates auto-apply when a learner earns a certificate.</p>
        </div>
        <Button onClick={() => store.addCertTemplate({
          name: 'Untitled template',
          background: 'linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)',
          borderColor: '#6366f1',
          width: 1200, height: 850,
          elements: [
            { id: `el-${Date.now()}-1`, type: 'title', x: 50, y: 30, w: 80, fontSize: 44, fontWeight: 700, color: '#1e293b', text: 'Certificate of Completion', align: 'center' },
            { id: `el-${Date.now()}-2`, type: 'recipient_name', x: 50, y: 55, w: 80, fontSize: 32, fontWeight: 600, color: '#4f46e5', text: '{{recipient_name}}', align: 'center' },
          ],
        })}>
          <Plus className="h-4 w-4 mr-1" /> New template
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
        {/* Template list */}
        <Card>
          <CardContent className="p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Templates</h4>
            <div className="space-y-1">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTplId(t.id); setSelectedElId(null); }}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                    t.id === tpl.id ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.elements.length} el</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <Input
                value={tpl.name}
                onChange={(e) => store.updateCertTemplate(tpl.id, { name: e.target.value })}
                className="max-w-xs"
              />
              <Button variant="outline" size="sm" onClick={() => store.deleteCertTemplate(tpl.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
            <div
              className="relative mx-auto aspect-[1200/850] w-full overflow-hidden rounded-lg border-4"
              style={{ background: tpl.background, borderColor: tpl.borderColor }}
            >
              {tpl.elements.map((el) => (
                <button
                  key={el.id}
                  onClick={() => setSelectedElId(el.id)}
                  className={`absolute border-2 px-2 py-1 ${
                    el.id === selectedElId ? 'border-rose-500 ring-2 ring-rose-300' : 'border-transparent hover:border-dashed hover:border-rose-300'
                  }`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.w}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: el.align,
                    fontSize: `${Math.max(8, el.fontSize / 16)}px`,
                    fontWeight: el.fontWeight,
                    color: el.color,
                    background: 'transparent',
                  }}
                >
                  {renderElementText(el)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Click an element to edit. Use the right panel to add new elements.</p>
          </CardContent>
        </Card>

        {/* Element toolbox */}
        <Card>
          <CardContent className="p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Add element</h4>
            <div className="mb-4 grid grid-cols-2 gap-1">
              {(Object.keys(ELEMENT_LABELS) as CertificateElementType[]).map((t) => (
                <Button key={t} variant="outline" size="sm" className="text-xs" onClick={() => addElement(t)}>
                  {ELEMENT_LABELS[t]}
                </Button>
              ))}
            </div>

            {selectedEl && (
              <>
                <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Edit · {ELEMENT_LABELS[selectedEl.type]}</h4>
                <div className="space-y-3">
                  {(selectedEl.type === 'static_text' || selectedEl.type === 'signature' || selectedEl.type === 'logo') && (
                    <div>
                      <Label className="text-xs">Text</Label>
                      <Input
                        value={selectedEl.text ?? ''}
                        onChange={(e) => store.updateCertElement(tpl.id, selectedEl.id, { text: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label className="text-xs">X %</Label>
                      <Input type="number" min={0} max={100} value={Math.round(selectedEl.x)}
                        onChange={(e) => store.updateCertElement(tpl.id, selectedEl.id, { x: Number(e.target.value) })} />
                    </div>
                    <div><Label className="text-xs">Y %</Label>
                      <Input type="number" min={0} max={100} value={Math.round(selectedEl.y)}
                        onChange={(e) => store.updateCertElement(tpl.id, selectedEl.id, { y: Number(e.target.value) })} />
                    </div>
                    <div><Label className="text-xs">W %</Label>
                      <Input type="number" min={5} max={100} value={Math.round(selectedEl.w)}
                        onChange={(e) => store.updateCertElement(tpl.id, selectedEl.id, { w: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">Font size</Label>
                      <Input type="number" min={8} max={80} value={selectedEl.fontSize}
                        onChange={(e) => store.updateCertElement(tpl.id, selectedEl.id, { fontSize: Number(e.target.value) })} />
                    </div>
                    <div><Label className="text-xs">Weight</Label>
                      <Select value={String(selectedEl.fontWeight)} onValueChange={(v) => store.updateCertElement(tpl.id, selectedEl.id, { fontWeight: Number(v) as 400 | 500 | 600 | 700 })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="400">Regular</SelectItem>
                          <SelectItem value="500">Medium</SelectItem>
                          <SelectItem value="600">Semibold</SelectItem>
                          <SelectItem value="700">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">Color</Label>
                      <Input type="color" value={selectedEl.color}
                        onChange={(e) => store.updateCertElement(tpl.id, selectedEl.id, { color: e.target.value })} />
                    </div>
                    <div><Label className="text-xs">Align</Label>
                      <Select value={selectedEl.align} onValueChange={(v) => store.updateCertElement(tpl.id, selectedEl.id, { align: v as 'left' | 'center' | 'right' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => { store.deleteCertElement(tpl.id, selectedEl.id); setSelectedElId(null); }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove element
                  </Button>
                </div>
              </>
            )}
            {!selectedEl && (
              <p className="text-xs text-muted-foreground">Select an element on the canvas to edit, or add a new one above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ELEMENT_LABELS: Record<CertificateElementType, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  recipient_name: 'Recipient Name',
  course_name: 'Course Name',
  score: 'Score',
  date: 'Issue Date',
  code: 'Validation Code',
  signature: 'Signature',
  logo: 'Logo / Brand',
  static_text: 'Static Text',
};

// ============================================================
// Custom Registration Forms
// ============================================================

const FIELD_KIND_LABELS: Record<RegistrationFieldKind, string> = {
  text: 'Text', email: 'Email', password: 'Password', select: 'Dropdown',
  checkbox: 'Checkbox', radio: 'Radio', textarea: 'Long text',
  date: 'Date', tel: 'Phone', number: 'Number',
};

export function RegistrationFormsTab() {
  const store = useAppStore();
  const forms = store.registrationForms;
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id ?? '');
  const form = forms.find((f) => f.id === selectedFormId) ?? forms[0];

  if (!form) return <Card><CardContent className="p-8 text-center text-muted-foreground">No forms.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Custom Registration Forms</h3>
        <p className="text-sm text-muted-foreground">Configure which fields appear on each role&apos;s registration screen. Changes apply instantly to the live signup form.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardContent className="p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Forms</h4>
            <div className="space-y-1">
              {forms.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormId(f.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                    f.id === form.id ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{f.name}</span>
                  <Badge variant="outline" className="text-xs">{f.role}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{form.name}</h4>
                <Badge variant="outline">role: {form.role}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label className="text-xs">Email verification</Label>
                  <Switch checked={form.requireEmailVerification} onCheckedChange={(v) => store.updateRegistrationForm(form.id, { requireEmailVerification: v })} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label className="text-xs">CAPTCHA</Label>
                  <Switch checked={form.requireCaptcha} onCheckedChange={(v) => store.updateRegistrationForm(form.id, { requireCaptcha: v })} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label className="text-xs">ToS accept</Label>
                  <Switch checked={form.requireTosAccept} onCheckedChange={(v) => store.updateRegistrationForm(form.id, { requireTosAccept: v })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold">Fields ({form.fields.length})</h4>
                <Button size="sm" onClick={() => store.addRegField(form.id, {
                  kind: 'text', label: 'New field', required: false, width: 'full',
                })}>
                  <Plus className="h-4 w-4 mr-1" /> Add field
                </Button>
              </div>
              <div className="space-y-2">
                {form.fields.map((fld) => (
                  <div key={fld.id} className="grid grid-cols-12 items-center gap-2 rounded-md border p-2">
                    <Select value={fld.kind} onValueChange={(v) => store.updateRegField(form.id, fld.id, { kind: v as RegistrationFieldKind })}>
                      <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(FIELD_KIND_LABELS) as RegistrationFieldKind[]).map((k) => (
                          <SelectItem key={k} value={k}>{FIELD_KIND_LABELS[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input className="col-span-4" placeholder="Label" value={fld.label}
                      onChange={(e) => store.updateRegField(form.id, fld.id, { label: e.target.value })} />
                    <Input className="col-span-3" placeholder="Placeholder (optional)" value={fld.placeholder ?? ''}
                      onChange={(e) => store.updateRegField(form.id, fld.id, { placeholder: e.target.value })} />
                    <div className="col-span-1 flex items-center justify-center">
                      <Switch checked={fld.required} onCheckedChange={(v) => store.updateRegField(form.id, fld.id, { required: v })} />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Button size="icon" variant="ghost" onClick={() => store.deleteRegField(form.id, fld.id)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {form.fields.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No fields yet — add one above.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Email Scheduling
// ============================================================

const EMAIL_KIND_META: Record<EmailScheduleKind, { label: string; color: string }> = {
  welcome: { label: 'Welcome', color: 'bg-emerald-100 text-emerald-700' },
  drip_unlock: { label: 'Drip unlock', color: 'bg-sky-100 text-sky-700' },
  expiry_reminder: { label: 'Expiry reminder', color: 'bg-amber-100 text-amber-700' },
  inactivity: { label: 'Inactivity', color: 'bg-orange-100 text-orange-700' },
  session_reminder: { label: 'Session reminder', color: 'bg-violet-100 text-violet-700' },
  certificate_issued: { label: 'Certificate', color: 'bg-fuchsia-100 text-fuchsia-700' },
  assignment_due: { label: 'Assignment due', color: 'bg-rose-100 text-rose-700' },
  weekly_progress: { label: 'Weekly digest', color: 'bg-cyan-100 text-cyan-700' },
};

export function EmailSchedulingTab() {
  const store = useAppStore();
  const schedules = store.emailSchedules;
  const [selectedId, setSelectedId] = useState(schedules[0]?.id ?? '');
  const sched = schedules.find((s) => s.id === selectedId) ?? schedules[0];

  if (!sched) return <Card><CardContent className="p-8 text-center text-muted-foreground">No schedules.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Email Scheduling</h3>
        <p className="text-sm text-muted-foreground">Automated email drips — welcome, drip-unlock, expiry, inactivity, session reminders, weekly digest. Toggle schedules on/off and edit templates.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Schedules ({schedules.length})</h4>
            <div className="space-y-1">
              {schedules.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                    s.id === sched.id ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'hover:bg-muted'
                  }`}
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.trigger}</div>
                  </div>
                  {s.enabled
                    ? <Badge className={`text-xs ${EMAIL_KIND_META[s.kind].color}`}>ON</Badge>
                    : <Badge variant="outline" className="text-xs">OFF</Badge>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{sched.name}</h4>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Enabled</Label>
                <Switch checked={sched.enabled} onCheckedChange={() => store.toggleEmailSchedule(sched.id)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Trigger</Label>
                <Input value={sched.trigger} onChange={(e) => store.updateEmailSchedule(sched.id, { trigger: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Delay (hours after trigger)</Label>
                <Input type="number" min={0} value={sched.delayHours}
                  onChange={(e) => store.updateEmailSchedule(sched.id, { delayHours: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Subject line</Label>
              <Input value={sched.subject} onChange={(e) => store.updateEmailSchedule(sched.id, { subject: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Body template (Markdown, supports {'{{vars}}'})</Label>
              <Textarea rows={10} value={sched.bodyTemplate}
                onChange={(e) => store.updateEmailSchedule(sched.id, { bodyTemplate: e.target.value })} />
              <p className="mt-1 text-xs text-muted-foreground">Variables: {'{{name}}, {{courseName}}, {{score}}, {{code}}, {{date}}, {{tutorName}}, {{topic}}, {{startTime}}, {{joinLink}}, {{renewLink}}, {{resumeLink}}, {{certLink}}, {{assignTitle}}, {{dueAt}}, {{lessonsCompleted}}, {{avgScore}}, {{badgesEarned}}, {{nextModuleTitle}}, {{model}}, {{expiryDate}}'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Analytics — KPI cards + funnel + series + top courses
// ============================================================

export function AnalyticsTab() {
  const store = useAppStore();
  const summary = store.analyticsSummary();

  const kpis = [
    { label: 'Total users', value: summary.totalUsers, icon: Users, color: 'text-sky-600' },
    { label: 'Active (7d)', value: summary.activeUsers7d, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Enrollments (30d)', value: summary.enrollments30d, icon: CheckCircle2, color: 'text-violet-600' },
    { label: 'Completions (30d)', value: summary.courseCompletions30d, icon: Award, color: 'text-amber-600' },
    { label: 'Revenue (30d)', value: `$${summary.revenue30d.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-700' },
    { label: 'Avg quiz score', value: `${summary.avgQuizScore}%`, icon: BarChart3, color: 'text-rose-600' },
  ];

  const maxEnrollments = Math.max(...summary.enrollmentsSeries.map((p) => p.count), 1);
  const maxRevenue = Math.max(...summary.revenueSeries.map((p) => p.amount), 1);
  const maxFunnel = Math.max(...summary.funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deep Analytics</h3>
          <p className="text-sm text-muted-foreground">Live product funnel, retention, course performance, revenue. Synced with Google Analytics 4 (Measurement ID G-XXXXXXXX).</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => store.trackEvent({ kind: 'page_view', meta: { page: 'admin-analytics' } })}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <k.icon className={`h-5 w-5 ${k.color}`} />
              <div className="mt-2 text-2xl font-bold">{k.value}</div>
              <div className="text-xs text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollments series */}
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-3 font-semibold">Weekly enrollments (8 weeks)</h4>
            <div className="flex h-44 items-end gap-2">
              {summary.enrollmentsSeries.map((p, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-500"
                    style={{ height: `${(p.count / maxEnrollments) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] text-muted-foreground">{new Date(p.ts).getDate()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue series */}
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-3 font-semibold">Weekly revenue (8 weeks)</h4>
            <div className="flex h-44 items-end gap-2">
              {summary.revenueSeries.map((p, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-teal-500"
                    style={{ height: `${(p.amount / maxRevenue) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] text-muted-foreground">${p.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-3 font-semibold">Conversion funnel</h4>
            <div className="space-y-2">
              {summary.funnel.map((f, i) => (
                <div key={f.stage}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{f.stage}</span>
                    <span className="font-semibold">{f.count} <span className="text-xs text-muted-foreground">({f.pct}%)</span></span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(f.count / maxFunnel) * 100}%`,
                        background: `linear-gradient(90deg, hsl(${220 + i * 30} 80% 55%), hsl(${220 + i * 30} 80% 65%))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top courses */}
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-3 font-semibold">Top courses</h4>
            <div className="space-y-2">
              {summary.topCourses.map((c) => {
                const course = COURSES.find((co) => co.id === c.courseId);
                return (
                  <div key={c.courseId} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{course?.icon ?? '📚'}</span>
                      <div>
                        <div className="text-sm font-medium">{course?.title ?? c.courseId}</div>
                        <div className="text-xs text-muted-foreground">{c.enrollments} enrolled · {c.completions} completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${c.revenue}</div>
                      <div className="text-xs text-muted-foreground">revenue</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// GDPR — data export bundles
// ============================================================

export function GdprTab() {
  const store = useAppStore();
  const bundles = store.gdprBundles;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">GDPR — Data Subject Requests</h3>
          <p className="text-sm text-muted-foreground">Process right-to-export requests. Bundles expire after 30 days. Right-to-erasure is available per-user from the Users tab.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 font-semibold">New export request</h4>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[240px]">
              <Label className="text-xs">User email or ID</Label>
              <Input id="gdpr-user-input" placeholder="e.g. u-cand-1" />
            </div>
            <Button onClick={() => {
              const v = (document.getElementById('gdpr-user-input') as HTMLInputElement)?.value?.trim();
              if (v) store.requestGdprExport(v);
            }}>
              <Lock className="h-4 w-4 mr-1" /> Generate bundle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="mb-3 font-semibold">Bundles ({bundles.length})</h4>
          <div className="space-y-2">
            {bundles.map((b) => {
              const user = store.users.find((u) => u.id === b.userId);
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                  <div>
                    <div className="font-medium">{user?.name ?? b.userId}</div>
                    <div className="text-xs text-muted-foreground">
                      Requested {new Date(b.requestedAt).toLocaleString()} · Expires {new Date(b.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === 'ready' && <Badge className="bg-emerald-100 text-emerald-700">Ready</Badge>}
                    {b.status === 'pending' && <Badge className="bg-amber-100 text-amber-700">Processing</Badge>}
                    {b.status === 'expired' && <Badge variant="outline">Expired</Badge>}
                    {b.status === 'ready' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {bundles.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No bundles yet.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-500" /> GDPR checklist</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✅ Data export — users can request a portable bundle of all their data (JSON + notes + submissions + DMs + activity).</li>
            <li>✅ Right to erasure — admins can fully delete a user from the Users tab; cascading deletes remove their notes, DMs, and forum posts.</li>
            <li>✅ Consent log — registration forms record ToS + Privacy Policy acceptance with a timestamp.</li>
            <li>✅ Data retention — bundles auto-expire after 30 days; analytics events pruned to 90 days.</li>
            <li>✅ Cookie consent banner — shown on first visit, choice persisted to localStorage.</li>
            <li>✅ Data Processing Agreement (DPA) — available for download with each integration&apos;s connection modal.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

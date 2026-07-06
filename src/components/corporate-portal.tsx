'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useT } from '@/components/language-currency-switcher';
import {
  Building2, Users, Award, Filter, Download, Plus, CheckCircle2,
  Clock, XCircle, TrendingUp, Search, ChevronRight,
  CreditCard, BookOpen, BarChart3, FileText, Shield,
  MessageSquare, Settings, Eye, Trash2, Star, Sparkles,
  Video, Mic, Globe, Check, ArrowRight, Phone,
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
    [currentUserId, users]
  );
}

// Public Corporate Landing Page
function CorporateLandingPage() {
  const { setAuthOpen, setTutorOpen } = useAppStore();
  const t = useT();

  const features = [
    {
      icon: BookOpen,
      title: 'Custom-Curated Courses',
      description: 'We design courses tailored to your organization\'s internal skill requirements, technology stack, and business goals. From onboarding programs to advanced upskilling tracks, every course is built specifically for your team.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Mic,
      title: 'AI Tutor for Employees',
      description: 'Our AI voice tutor guides each employee through lessons at their own pace, providing personalized explanations, interactive quizzes, and real-time doubt resolution — available 24/7 in multiple Indian languages.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Video,
      title: 'AI Interviews & Assessment',
      description: 'Evaluate employee progress with AI-proctored video interviews that assess communication, technical depth, and problem-solving — giving managers actionable skill-gap insights for every team member.',
      color: 'from-rose-500 to-pink-600',
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      description: 'Employees earn industry-recognized certificates upon course completion, verified by MarqAI Tech Pvt Ltd. Certificates can be validated online, adding credibility to your team\'s skill portfolio.',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const plans = [
    {
      name: 'Single Course',
      price: 'One-time',
      description: 'Perfect for teams needing training on a specific technology or skill. Pick any course from our 6 career tracks.',
      features: [
        '1 course access',
        'AI voice tutoring',
        'Quizzes & assessments',
        'Certificate on completion',
        'Progress tracking dashboard',
      ],
      popular: false,
      buttonText: 'Get Started',
    },
    {
      name: 'All Courses — Monthly',
      price: 'Monthly',
      description: 'Unlimited access to all 6 career tracks for your entire team. Ideal for ongoing skill development across the organization.',
      features: [
        'All 6 career tracks',
        'AI voice tutoring',
        'AI-proctored interviews',
        'Verified certificates',
        'Employee skill matrix',
        'Priority support',
      ],
      popular: true,
      buttonText: 'Get Started',
    },
    {
      name: 'All Courses — Annual',
      price: 'Annual',
      description: 'Best value — save 30% with annual billing. Full platform access with dedicated onboarding and custom course curation.',
      features: [
        'Everything in Monthly',
        'Save 30% vs monthly',
        'Custom course curation',
        'Dedicated account manager',
        'SLA-backed support',
        'Quarterly skill reports',
      ],
      popular: false,
      buttonText: 'Get Started',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Building2 className="mr-1.5 h-3.5 w-3.5" /> Corporate Training Solutions
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Customized AI-Powered Training
            <span className="block text-emerald-600 dark:text-emerald-400">for Your Team</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            We curate courses aligned to your internal skill requirements. Our AI tutor personalizes learning for every employee, while you get bulk pricing flexibility — single course, monthly, or annually.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700"
              onClick={() => setAuthOpen(true, 'register', 'corporate_admin')}
            >
              <Building2 className="mr-2 h-5 w-5" /> Register Your Company
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setAuthOpen(true, 'login')}
            >
              Sign in to Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Infographic Style */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            How MarqAI Courses Empowers Your Organization
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From custom course curation to AI-proctored assessments, we provide everything your team needs to upskill effectively.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <Card key={idx} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
              <CardContent className="pt-6 pb-6">
                <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Plans - Infographic Style */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Flexible Corporate Plans
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">
            Register for individual courses or get bulk access for your entire team
          </h2>
          <p className="mt-2 text-muted-foreground">Scale as your organization grows.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card 
              key={idx} 
              className={`relative overflow-hidden ${plan.popular ? 'border-2 border-emerald-500 shadow-xl' : 'border shadow-lg'} bg-white dark:bg-slate-800`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-base font-semibold">{plan.price}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => setAuthOpen(true, 'register', 'corporate_admin')}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to upskill your team?
            </h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              Join leading companies using MarqAI Courses to train their workforce with AI-powered, personalized learning paths.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-emerald-700 hover:bg-white/90"
                onClick={() => setAuthOpen(true, 'register', 'corporate_admin')}
              >
                <Building2 className="mr-2 h-5 w-5" /> Register Your Company
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setTutorOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" /> Talk to MarqAI
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Corporate Admin Portal (for logged-in corporate users)
function CorporateAdminPortal() {
  const user = useCurrentUser();
  const store = useAppStore();
  const t = useT();

  // ... existing admin portal logic would go here for logged-in corporate users
  // For now, show a placeholder since the full admin portal is complex

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Corporate Portal</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">
            <Building2 className="mr-1.5 h-3.5 w-3.5" /> {user?.role === 'corporate_admin' ? 'Admin' : 'Employee'}
          </Badge>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Company Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Dashboard content for corporate admin...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your team's learning progress...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Assign courses to your employees...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Skill Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">View skill-gap analysis and progress reports...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function CorporatePortal() {
  const user = useCurrentUser();

  // Show landing page for non-logged-in users or non-corporate users
  // Show admin portal for logged-in corporate users
  if (user && (user.role === 'corporate_admin' || user.role === 'corporate_user')) {
    return <CorporateAdminPortal />;
  }

  return <CorporateLandingPage />;
}
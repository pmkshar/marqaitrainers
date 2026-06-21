'use client';

import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';
import { COURSES } from '@/lib/courses';
import { useAppStore } from '@/lib/store';

export function Footer() {
  const { openCourse, goHome, setTutorOpen, openPricing, openTutors, openAdmin, currentUser } = useAppStore();
  const user = currentUser();
  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-base font-bold">Marq<span className="text-emerald-600 dark:text-emerald-400">AI</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            The complete software training platform — AI tutor + human tutors, step-wise lessons, video walkthroughs, graded tests, and a Super Admin portal with full RBAC.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Courses</h3>
          <ul className="space-y-2 text-sm">
            {COURSES.map((c) => (
              <li key={c.id}><button onClick={() => openCourse(c.id)} className="text-muted-foreground transition-colors hover:text-foreground">{c.title}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li><button onClick={goHome} className="text-muted-foreground hover:text-foreground">Home</button></li>
            <li><button onClick={openPricing} className="text-muted-foreground hover:text-foreground">Pricing &amp; Subscriptions</button></li>
            <li><button onClick={openTutors} className="text-muted-foreground hover:text-foreground">Human Tutors</button></li>
            <li><button onClick={() => setTutorOpen(true)} className="text-muted-foreground hover:text-foreground">AI Tutor</button></li>
            <li><button onClick={() => useAppStore.getState().setAuthOpen(true, 'register', 'tutor')} className="text-muted-foreground hover:text-foreground">Become a Tutor</button></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Admin</h3>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => openAdmin('dashboard')} className="text-muted-foreground hover:text-foreground">Super Admin Portal</button></li>
            <li><button onClick={() => openAdmin('users')} className="text-muted-foreground hover:text-foreground">User Management</button></li>
            <li><button onClick={() => openAdmin('roles')} className="text-muted-foreground hover:text-foreground">Roles &amp; Permissions</button></li>
            <li><button onClick={() => openAdmin('integrations')} className="text-muted-foreground hover:text-foreground">Integrations</button></li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {user ? `Signed in as ${user.name}` : 'Demo mode — sign in as admin@marqai.dev to explore.'}
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Marq AI Software Tutor. All rights reserved.</span>
          <span>Powered by Z.ai · Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}

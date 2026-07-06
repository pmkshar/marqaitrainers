'use client';

import { GraduationCap, Menu, X, Sparkles, MessageCircle, LogIn, User as UserIcon, ShieldCheck, LayoutDashboard, BookOpen, LogOut, ChevronDown, BadgeCheck, Bell, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { COURSES } from '@/lib/courses';
import { NotificationsBell } from './notifications-bell';
import { LanguageCurrencySwitcher } from './language-currency-switcher';

export function Navbar() {
  const {
    view, isMenuOpen, toggleMenu, goHome, openCourse,
    setTutorOpen, openPricing, openTutors, openAdmin, openTutorPortal, openMyLearning, openDashboard, openFeatures,
    currentUser, logout, setAuthOpen,
  } = useAppStore();
  const user = currentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={goHome}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Go to homepage"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              Marq<span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Software Tutor</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={goHome}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              view.name === 'home' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Home
          </button>
          <div className="group relative">
            <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Courses
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border bg-popover p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCourse(c.id)}
                  className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-accent"
                >
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                    <CourseIcon name={c.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{c.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={openTutors}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${view.name === 'tutors' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Human Tutors
          </button>
          <button
            onClick={openPricing}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${view.name === 'pricing' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pricing
          </button>
          <button
            onClick={openFeatures}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${view.name === 'features' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Features
          </button>
          <button
            onClick={() => setTutorOpen(true)}
            className="ml-2 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            AI Tutor
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button
                onClick={openDashboard}
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
              </Button>
              <NotificationsBell />
              <LanguageCurrencySwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border bg-card pl-1 pr-2 py-1 text-sm transition-colors hover:bg-accent">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={`bg-gradient-to-br ${user.avatarColor} text-white text-xs font-bold`}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[100px] truncate font-medium sm:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      <Badge variant="secondary" className="mt-1 w-fit text-[10px] capitalize">
                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'tutor' ? 'Human Tutor' : user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={openDashboard}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  {user.role === 'candidate' && (
                    <DropdownMenuItem onClick={openMyLearning}>
                      <BookOpen className="mr-2 h-4 w-4" /> My Learning
                    </DropdownMenuItem>
                  )}
                  {user.role === 'tutor' && (
                    <DropdownMenuItem onClick={openTutorPortal}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Tutor Portal
                    </DropdownMenuItem>
                  )}
                  {user.role === 'super_admin' && (
                    <DropdownMenuItem onClick={() => openAdmin('dashboard')}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Admin Portal
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={openFeatures}>
                    <Grid3x3 className="mr-2 h-4 w-4" /> Features
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTutorOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" /> Ask AI Tutor
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-rose-600 dark:text-rose-400">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!user && (
            <>
              <LanguageCurrencySwitcher />
              <Button
                onClick={() => setAuthOpen(true, 'login')}
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <LogIn className="mr-1.5 h-4 w-4" /> Sign in
              </Button>
            </>
          )}
          <Button
            onClick={() => setTutorOpen(true)}
            className="hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 sm:inline-flex"
            size="sm"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Ask AI
          </Button>
          <button
            onClick={toggleMenu}
            className="grid h-10 w-10 place-items-center rounded-md text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <button onClick={goHome} className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent">Home</button>
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Courses</p>
            {COURSES.map((c) => (
              <button key={c.id} onClick={() => openCourse(c.id)} className="flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent">
                <span className={`grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br ${c.gradient} text-white`}>
                  <CourseIcon name={c.icon} />
                </span>
                <span className="text-sm font-medium">{c.title}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{c.level}</Badge>
              </button>
            ))}
            <button onClick={openTutors} className="mt-1 rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent">Human Tutors</button>
            <button onClick={openPricing} className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent">Pricing</button>
            <button onClick={openFeatures} className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent">Features</button>
            <button onClick={() => setTutorOpen(true)} className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent">AI Tutor</button>
            <div className="mt-2 border-t pt-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`bg-gradient-to-br ${user.avatarColor} text-white text-xs font-bold`}>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button onClick={openDashboard} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">Dashboard</button>
                  {user.role === 'candidate' && <button onClick={openMyLearning} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">My Learning</button>}
                  {user.role === 'tutor' && <button onClick={openTutorPortal} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">Tutor Dashboard</button>}
                  {user.role === 'super_admin' && <button onClick={() => openAdmin('dashboard')} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">Admin Portal</button>}
                  <button onClick={logout} className="w-full rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-accent">Sign out</button>
                </>
              ) : (
                <Button onClick={() => setAuthOpen(true, 'login')} className="w-full">
                  <LogIn className="mr-1.5 h-4 w-4" /> Sign in / Register
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function CourseIcon({ name, className }: { name: string; className?: string }) {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    BrainCircuit: (p) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
        <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      </svg>
    ),
    Coffee: (p) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
        <path d="M6 2v2" />
      </svg>
    ),
    Boxes: (p) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
        <path d="m7 16.5-4-2.5M7 16.5l5-3M7 16.5v5.17" />
        <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
        <path d="m17 16.5-5-3M17 16.5l4-2.5M17 16.5v5.17" />
        <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
        <path d="M12 8 7.5 5.5M12 8l4.5-2.5M12 13.5V8" />
      </svg>
    ),
    Smartphone: (p) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    Wind: (p) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2" />
      </svg>
    ),
    Code2: (p) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </svg>
    ),
  };
  const Cmp = map[name] ?? map.BrainCircuit;
  return <Cmp className={className ?? 'h-5 w-5'} />;
}

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/types';
import { SUPPORTED_CURRENCIES, COUNTRY_TIMEZONES } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Globe,
  DollarSign,
  MapPin,
  User,
  Check,
  Shield,
  Mail,
  Clock,
} from 'lucide-react';

type UserWithFields = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  enrolledCourseIds: string[];
  approvedCourseIds: string[];
  corporateId?: string;
  createdAt: number;
  status: string;
  twoFactorEnabled?: boolean;
  profilePhotoUrl?: string;
  permissions?: string[];
  tutorProfile?: unknown;
};

function useCurrentUser(): UserWithFields | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () =>
      currentUserId
        ? (users.find((u) => u.id === currentUserId) as UserWithFields | undefined) ?? null
        : null,
    [currentUserId, users],
  );
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  tutor: 'Tutor',
  candidate: 'Candidate',
  corporate_admin: 'Corporate Admin',
  corporate_user: 'Corporate User',
  guest: 'Guest',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  tutor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  candidate: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  corporate_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  corporate_user: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  guest: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
};

export function SettingsPage() {
  const currentUser = useCurrentUser();
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const country = useAppStore((s) => s.country);
  const timezone = useAppStore((s) => s.timezone);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const setLocale = useAppStore((s) => s.setLocale);
  const goHome = useAppStore((s) => s.goHome);

  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const flashSaved = useCallback((label: string) => {
    setSavedFlash(label);
    setTimeout(() => setSavedFlash(null), 2200);
  }, []);

  // ─── Not-logged-in state ────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Sign in required</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Please sign in to access your account settings and customize your language, currency, and
          country preferences.
        </p>
        <Button onClick={goHome} className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Home
        </Button>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[currentUser.role] ?? currentUser.role;
  const roleColor = ROLE_COLORS[currentUser.role] ?? ROLE_COLORS.guest;
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const currentCurrencyMeta = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const currentCountryMeta = COUNTRY_TIMEZONES[country];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goHome}
          className="shrink-0 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          aria-label="Go back home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, language, currency, and country preferences.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── 1. Profile Section ──────────────────────────────── */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 pb-4 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-emerald-600" />
              Profile
            </CardTitle>
            <CardDescription>Your account information (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-0 sm:grid-cols-3">
              {/* Avatar / Name */}
              <div className="flex items-center gap-4 border-b p-5 sm:col-span-3 sm:border-b-0">
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-bold text-white shadow-md"
                  style={{ backgroundColor: currentUser.avatarColor || '#10b981' }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{currentUser.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge className={`${roleColor} border-0 font-medium`}>{roleLabel}</Badge>
                    {currentUser.status === 'active' && (
                      <Badge
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                      >
                        ● Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 border-b p-5 sm:border-b-0 sm:border-r">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="truncate text-sm font-medium">{currentUser.email}</p>
                </div>
              </div>

              {/* Courses Enrolled */}
              <div className="flex items-center gap-3 border-b p-5 sm:border-b-0 sm:border-r">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Courses Enrolled</p>
                  <p className="text-sm font-medium">{currentUser.enrolledCourseIds.length}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 p-5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date(currentUser.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Language Preferences ──────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5 text-emerald-600" />
              Language Preferences
            </CardTitle>
            <CardDescription>
              Choose your preferred language. The UI will switch instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={language}
              onValueChange={(v) => {
                setLanguage(v as LanguageCode);
                flashSaved('Language');
              }}
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <label
                  key={lang.code}
                  htmlFor={`lang-${lang.code}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 ${
                    language === lang.code
                      ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30 dark:border-emerald-600 dark:bg-emerald-950/30 dark:ring-emerald-600/30'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} className="sr-only" />
                  <span className="text-xl">{lang.flag}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{lang.nativeName}</p>
                    <p className="text-xs text-muted-foreground">{lang.label}</p>
                  </div>
                  {language === lang.code && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                </label>
              ))}
            </RadioGroup>
            {currentLangMeta && (
              <p className="mt-3 text-xs text-muted-foreground">
                Current: {currentLangMeta.flag} {currentLangMeta.nativeName} ({currentLangMeta.label})
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── 3. Currency Preferences ──────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Currency Preferences
            </CardTitle>
            <CardDescription>
              All prices will be shown in your selected currency, converted at current FX rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currency}
              onValueChange={(v) => {
                setCurrency(v as CurrencyCode);
                flashSaved('Currency');
              }}
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {SUPPORTED_CURRENCIES.map((cur) => (
                <label
                  key={cur.code}
                  htmlFor={`cur-${cur.code}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 ${
                    currency === cur.code
                      ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30 dark:border-emerald-600 dark:bg-emerald-950/30 dark:ring-emerald-600/30'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value={cur.code} id={`cur-${cur.code}`} className="sr-only" />
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {cur.symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{cur.code}</p>
                    <p className="text-xs text-muted-foreground">{cur.label}</p>
                  </div>
                  {currency === cur.code && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                </label>
              ))}
            </RadioGroup>
            {currentCurrencyMeta && (
              <p className="mt-3 text-xs text-muted-foreground">
                Current: {currentCurrencyMeta.symbol} {currentCurrencyMeta.code} —{' '}
                {currentCurrencyMeta.label}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── 4. Country / Timezone ───────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Country &amp; Timezone
            </CardTitle>
            <CardDescription>
              Sessions, calendar, and reminders are shown in your local time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Country Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="country-select" className="text-sm font-medium">
                  Country
                </Label>
                <Select
                  value={country}
                  onValueChange={(v) => {
                    const tzInfo = COUNTRY_TIMEZONES[v];
                    if (tzInfo) {
                      setLocale({ country: v, timezone: tzInfo.timezone, currency: tzInfo.currency });
                    } else {
                      setLocale({ country: v });
                    }
                    flashSaved('Country');
                  }}
                >
                  <SelectTrigger id="country-select" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRY_TIMEZONES).map(([code, info]) => (
                      <SelectItem key={code} value={code}>
                        {info.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentCountryMeta && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {currentCountryMeta.country}
                  </p>
                )}
              </div>

              {/* Timezone Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="timezone-select" className="text-sm font-medium">
                  Timezone
                </Label>
                <Select
                  value={timezone}
                  onValueChange={(v) => {
                    setLocale({ timezone: v });
                    flashSaved('Timezone');
                  }}
                >
                  <SelectTrigger id="timezone-select" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRY_TIMEZONES).map(([code, info]) => (
                      <SelectItem key={code} value={info.timezone}>
                        {info.country} — {info.timezone.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Current: {timezone.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">Active locale summary:</p>
              <Badge variant="outline" className="gap-1.5 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
                <Globe className="h-3 w-3" />
                {currentLangMeta?.nativeName ?? language}
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
                <DollarSign className="h-3 w-3" />
                {currency}
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
                <MapPin className="h-3 w-3" />
                {currentCountryMeta?.country ?? country}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── Saved Indicator ──────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <div
            className={`flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-all duration-300 dark:text-emerald-400 ${
              savedFlash
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0'
            }`}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-3 w-3" />
            </span>
            {savedFlash} saved!
          </div>
        </div>
      </div>
    </div>
  );
}

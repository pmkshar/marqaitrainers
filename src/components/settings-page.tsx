'use client';

import { useRef, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useT } from '@/components/language-currency-switcher';
import {
  Globe, DollarSign, Clock, Shield, ShieldCheck, ShieldAlert,
  Smartphone, Check, Loader2, Download, Trash2, Lock, AlertTriangle, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { SUPPORTED_CURRENCIES as CURRENCIES, COUNTRY_TIMEZONES as TZS } from '@/lib/currency';
import type { LanguageCode, CurrencyCode, User } from '@/lib/types';

function useCurrentUser(): User | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

export function SettingsPage() {
  const t = useT();
  const currentUser = useCurrentUser();
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const timezone = useAppStore((s) => s.timezone);
  const country = useAppStore((s) => s.country);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const setLocale = useAppStore((s) => s.setLocale);
  const enableTwoFactor = useAppStore((s) => s.enableTwoFactor);
  const disableTwoFactor = useAppStore((s) => s.disableTwoFactor);
  const downloadGdprExport = useAppStore((s) => s.downloadGdprExport);
  const deleteMyAccount = useAppStore((s) => s.deleteMyAccount);
  const setProfilePhoto = useAppStore((s) => s.setProfilePhoto);
  const { toast } = useToast();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Please sign in to access settings.</p>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'corporate_admin';
  const twoFactorEnabled = currentUser.twoFactorEnabled ?? false;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handle2FAToggle = () => {
    setTwoFactorLoading(true);
    setTimeout(() => {
      if (twoFactorEnabled) {
        disableTwoFactor(currentUser.id);
      } else {
        enableTwoFactor(currentUser.id);
      }
      setTwoFactorLoading(false);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your language, currency, timezone, and security preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              {t('settings.language')} &amp; {t('settings.currency')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('settings.language')}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      <span className="mr-2">{l.flag}</span> {l.nativeName} ({l.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">UI will switch instantly. Course content is also localized where available.</p>
            </div>

            <div className="space-y-1.5">
              <Label>{t('settings.currency')}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="mr-2 font-semibold">{c.symbol}</span> {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">All prices shown in your selected currency. Converted at current FX rates.</p>
            </div>

            <div className="space-y-1.5">
              <Label>{t('settings.country')}</Label>
              <Select
                value={country}
                onValueChange={(v) => {
                  const tz = TZS[v];
                  if (tz) setLocale({ country: v, timezone: tz.timezone, currency: tz.currency });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TZS).map(([code, info]) => (
                    <SelectItem key={code} value={code}>{info.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t('settings.timezone')}</Label>
              <Select value={timezone} onValueChange={(v) => setLocale({ timezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TZS).map(([code, info]) => (
                    <SelectItem key={code} value={info.timezone}>
                      {info.country} — {info.timezone.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Sessions, calendar, and reminders are shown in your local time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile photo (candidate) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-lg dark:border-slate-700">
                  {currentUser.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.profilePhotoUrl}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Preview</p>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your photo appears on your certificates, resume templates, and profile cards.
                  Use a clear, front-facing headshot with a plain background for best results.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => photoInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    <Camera className="mr-1.5 h-3.5 w-3.5" /> Upload photo
                  </Button>
                  {currentUser.profilePhotoUrl && (
                    <Button
                      onClick={() => {
                        setProfilePhoto('');
                        toast({ title: 'Photo removed', description: 'Your initials will be used instead.' });
                      }}
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 2 * 1024 * 1024) {
                      toast({
                        title: 'Image too large',
                        description: 'Please use an image under 2 MB.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    try {
                      const dataUrl = await resizeImageToDataUrl(f, 400, 400);
                      setProfilePhoto(dataUrl);
                      toast({
                        title: 'Photo uploaded',
                        description: 'Your photo will appear on future certificates and resume templates.',
                      });
                    } catch (err) {
                      console.error('Photo resize error:', err);
                      toast({
                        title: 'Could not upload photo',
                        description: 'Please try a different image file.',
                        variant: 'destructive',
                      });
                    }
                  }}
                  className="hidden"
                />
                <p className="text-[10px] text-muted-foreground">
                  PNG, JPG, or WebP. Max 2 MB. Auto-resized to 400×400.
                  Stored as a base64 data URL in your browser — not uploaded to a server.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security / 2FA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              {t('settings.security')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${
                    twoFactorEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {twoFactorEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                  </span>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {t('settings.twoFactor')}
                      {isAdmin && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">REQUIRED FOR ADMINS</span>}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{t('settings.twoFactorDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {twoFactorLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handle2FAToggle}
                    disabled={twoFactorLoading}
                  />
                </div>
              </div>
              {twoFactorEnabled && (
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <p className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                    <Smartphone className="h-4 w-4" />
                    2FA is active. Verification code required at every admin login.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-600" /> bcrypt password hashing</div>
              <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-600" /> Session timeouts (30 min idle)</div>
              <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-600" /> AES-256 data encryption at rest</div>
              <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-600" /> GDPR-compliant data export</div>
              <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-600" /> Audit logs for admin actions</div>
              <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-600" /> Role-based access control (RBAC)</div>
            </div>
          </CardContent>
        </Card>

        {/* GDPR — Data export & account deletion */}
        <Card className="border-rose-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-rose-600" /> Privacy &amp; GDPR — Your data, your control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Download className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">Download your data</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Export all your account data as a JSON file: profile, completed lessons, certificates,
                    badges, notes, forum posts, bookings, tickets, and chat history. Processing takes a
                    few seconds.
                  </p>
                  <Button
                    onClick={() => {
                      downloadGdprExport();
                      toast({ title: 'Data export ready', description: 'Your JSON file is downloading now.' });
                    }}
                    className="mt-3 bg-emerald-600 text-white hover:bg-emerald-700"
                    size="sm"
                  >
                    <Download className="mr-1 h-3.5 w-3.5" /> Download my data
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Delete my account</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Permanently delete your account and all associated data: profile, progress, certificates,
                    bookings, tickets, and chat history. <strong>This action cannot be undone.</strong> You will
                    be signed out immediately.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="mt-3">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete my account permanently
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all data associated with
                          <strong> {currentUser?.email}</strong>. This action cannot be undone. If you want
                          to keep your certificates and progress, click Cancel and use "Download my data" first.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteMyAccount();
                            toast({ title: 'Account deleted', description: 'Your data has been permanently removed.', variant: 'destructive' });
                          }}
                          className="bg-rose-600 hover:bg-rose-700"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" /> {t('settings.saved')}
            </span>
          )}
          <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Helper: resize an uploaded image file to a square data URL.
// Uses an offscreen canvas — keeps localStorage size small
// (a 400×400 JPEG is ~30KB) and works on every modern browser.
// ============================================================
function resizeImageToDataUrl(file: File, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        // Cover-fit (center-crop) the image into the square canvas
        const scale = Math.max(width / img.width, height / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        const sx = (width - sw) / 2;
        const sy = (height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

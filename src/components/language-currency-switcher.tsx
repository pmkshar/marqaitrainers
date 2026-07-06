'use client';

import { useAppStore } from '@/lib/store';
import { translate, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/types';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SUPPORTED_CURRENCIES, COUNTRY_TIMEZONES } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/types';

export function LanguageCurrencySwitcher() {
  const language = useAppStore((s) => s.language);
  const currency = useAppStore((s) => s.currency);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const setLocale = useAppStore((s) => s.setLocale);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  void currentLang;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium uppercase">{language}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-medium">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Language
        </DropdownMenuLabel>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as LanguageCode)}
            className={`flex items-center justify-between gap-2 ${language === lang.code ? 'bg-accent' : ''}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm">{lang.nativeName}</span>
            </span>
            {language === lang.code && <span className="text-xs text-emerald-600">✓</span>}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Currency
        </DropdownMenuLabel>
        {SUPPORTED_CURRENCIES.map((cur) => (
          <DropdownMenuItem
            key={cur.code}
            onClick={() => setCurrency(cur.code as CurrencyCode)}
            className={`flex items-center justify-between gap-2 ${currency === cur.code ? 'bg-accent' : ''}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold w-6">{cur.symbol}</span>
              <span className="text-sm">{cur.code}</span>
              <span className="text-xs text-muted-foreground">{cur.label}</span>
            </span>
            {currency === cur.code && <span className="text-xs text-emerald-600">✓</span>}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Country / Timezone
        </DropdownMenuLabel>
        {Object.entries(COUNTRY_TIMEZONES).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale({ country: code, timezone: info.timezone, currency: info.currency })}
            className="flex items-center justify-between gap-2"
          >
            <span className="text-sm">{info.country}</span>
            <span className="text-xs text-muted-foreground">{info.timezone.split('/').pop()?.replace('_', ' ')}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to translate UI text using the current language
export function useT() {
  const language = useAppStore((s) => s.language);
  return (key: string, fallback?: string) => translate(language, key, fallback);
}

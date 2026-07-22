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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageCurrencySwitcher() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium uppercase">{language}</span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to translate UI text using the current language
export function useT() {
  const language = useAppStore((s) => s.language);
  return (key: string, fallback?: string) => translate(language, key, fallback);
}

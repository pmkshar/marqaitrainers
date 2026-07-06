// ============================================================
// Multi-currency support
// ============================================================
import type { CurrencyCode } from '@/lib/types';

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; symbol: string; label: string; locale: string }[] = [
  { code: 'USD', symbol: '$',  label: 'US Dollar',         locale: 'en-US' },
  { code: 'EUR', symbol: '€',  label: 'Euro',              locale: 'de-DE' },
  { code: 'GBP', symbol: '£',  label: 'British Pound',     locale: 'en-GB' },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen',      locale: 'ja-JP' },
  { code: 'INR', symbol: '₹',  label: 'Indian Rupee',      locale: 'en-IN' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar',   locale: 'en-CA' },
];

// Approximate static conversion rates (relative to USD).
// In production these would come from a live FX API (e.g. exchangerate-api).
export const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156.4,
  INR: 83.5,
  AUD: 1.51,
  CAD: 1.37,
};

export function convertFromUSD(amountUSD: number, target: CurrencyCode): number {
  const rate = USD_RATES[target] ?? 1;
  return amountUSD * rate;
}

export function convertToUSD(amount: number, source: CurrencyCode): number {
  const rate = USD_RATES[source] ?? 1;
  return amount / rate;
}

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  const usd = convertToUSD(amount, from);
  return convertFromUSD(usd, to);
}

export function formatPrice(amountUSD: number, currency: CurrencyCode): string {
  const value = convertFromUSD(amountUSD, currency);
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const locale = config?.locale ?? 'en-US';
  const minimumFractionDigits = currency === 'JPY' ? 0 : 2;
  const maximumFractionDigits = currency === 'JPY' ? 0 : 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `${config?.symbol ?? ''}${value.toFixed(maximumFractionDigits)}`;
  }
}

export function formatLocalizedDate(date: Date | number, timezone: string, language: string): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    en: 'en-US', es: 'es-ES', de: 'de-DE', ja: 'ja-JP', hi: 'hi-IN', fr: 'fr-FR',
  };
  const locale = localeMap[language] ?? 'en-US';
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

// Common timezones by country — used in settings dropdown
export const COUNTRY_TIMEZONES: Record<string, { country: string; timezone: string; currency: CurrencyCode }> = {
  US: { country: 'United States',   timezone: 'America/New_York',    currency: 'USD' },
  ES: { country: 'Spain',           timezone: 'Europe/Madrid',       currency: 'EUR' },
  DE: { country: 'Germany',         timezone: 'Europe/Berlin',       currency: 'EUR' },
  FR: { country: 'France',          timezone: 'Europe/Paris',        currency: 'EUR' },
  GB: { country: 'United Kingdom',  timezone: 'Europe/London',       currency: 'GBP' },
  JP: { country: 'Japan',           timezone: 'Asia/Tokyo',          currency: 'JPY' },
  IN: { country: 'India',           timezone: 'Asia/Kolkata',        currency: 'INR' },
  AU: { country: 'Australia',       timezone: 'Australia/Sydney',    currency: 'AUD' },
  CA: { country: 'Canada',          timezone: 'America/Toronto',     currency: 'CAD' },
};

export const COUNTRY_LIST = Object.entries(COUNTRY_TIMEZONES).map(([code, info]) => ({
  code, ...info,
}));

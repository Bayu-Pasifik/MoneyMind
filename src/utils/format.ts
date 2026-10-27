import { Locale } from '../i18n/LocaleContext';

const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', id: 'id-ID' };

export function formatCurrency(amount: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Live-typing helper: keeps digits only and groups thousands with dots ("2000000" -> "Rp 2.000.000").
export function formatAmountInput(raw: string, withPrefix = true) {
  const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (!digits) return '';
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withPrefix ? `Rp ${grouped}` : grouped;
}

export function parseAmountInput(text: string) {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export function formatDate(iso: string, locale: Locale = 'en') {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale = 'en') {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

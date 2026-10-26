import { Transaction } from '../types/transaction';
import { Locale, TFunction } from '../i18n/LocaleContext';

const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', id: 'id-ID' };

export type TransactionSection = {
  title: string;
  data: Transaction[];
};

function dayLabel(iso: string, t: TFunction, locale: Locale): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return t('common.today');
  if (isSameDay(date, yesterday)) return t('common.yesterday');

  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function groupTransactionsByDay(
  transactions: Transaction[],
  t: TFunction,
  locale: Locale
): TransactionSection[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sections: TransactionSection[] = [];
  for (const transaction of sorted) {
    const title = dayLabel(transaction.date, t, locale);
    const existing = sections.find((section) => section.title === title);
    if (existing) {
      existing.data.push(transaction);
    } else {
      sections.push({ title, data: [transaction] });
    }
  }
  return sections;
}

import { Transaction, TransactionCategory } from '../types/transaction';
import { Period } from './period';
import { Locale, TFunction } from '../i18n/LocaleContext';

const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', id: 'id-ID' };

export type CategoryBreakdown = {
  category: TransactionCategory;
  total: number;
  ratio: number;
};

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenses = transactions.filter((item) => item.type === 'expense');
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  const totalsByCategory = new Map<TransactionCategory, number>();
  for (const item of expenses) {
    totalsByCategory.set(item.category, (totalsByCategory.get(item.category) ?? 0) + item.amount);
  }

  return [...totalsByCategory.entries()]
    .map(([category, categoryTotal]) => ({
      category,
      total: categoryTotal,
      ratio: total > 0 ? categoryTotal / total : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export type DayTotal = {
  label: string;
  total: number;
};

export function getLastNDaysExpenseTotals(transactions: Transaction[], days: number): DayTotal[] {
  const results: DayTotal[] = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);

    const total = transactions
      .filter((item) => item.type === 'expense')
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === day.getFullYear() &&
          itemDate.getMonth() === day.getMonth() &&
          itemDate.getDate() === day.getDate()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    results.push({
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day),
      total,
    });
  }

  return results;
}

const TREND_BUCKETS: Record<Period, { count: number; bucketDays: number }> = {
  week: { count: 7, bucketDays: 1 },
  month: { count: 6, bucketDays: 5 },
  '3months': { count: 6, bucketDays: 15 },
  year: { count: 12, bucketDays: 30 },
};

export function getTrendChartTitle(t: TFunction, period: Period): string {
  return t(`trend.${period}`);
}

function bucketLabel(locale: Locale, period: Period, start: Date): string {
  const intlLocale = INTL_LOCALE[locale];
  if (period === 'week') {
    return new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(start);
  }
  if (period === 'year') {
    return new Intl.DateTimeFormat(intlLocale, { month: 'short' }).format(start);
  }
  return new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short' }).format(start);
}

function getYearlyMonthTotals(transactions: Transaction[], locale: Locale): DayTotal[] {
  const year = new Date().getFullYear();
  const results: DayTotal[] = [];

  for (let month = 0; month < 12; month += 1) {
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const total = transactions
      .filter((item) => item.type === 'expense')
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    results.push({ label: bucketLabel(locale, 'year', start), total });
  }

  return results;
}

export function getTrendTotals(transactions: Transaction[], period: Period, locale: Locale): DayTotal[] {
  if (period === 'year') {
    return getYearlyMonthTotals(transactions, locale);
  }

  const { count, bucketDays } = TREND_BUCKETS[period];
  const results: DayTotal[] = [];
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (let i = count - 1; i >= 0; i -= 1) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * bucketDays);
    const start = new Date(end);
    start.setDate(end.getDate() - bucketDays + 1);
    start.setHours(0, 0, 0, 0);

    const total = transactions
      .filter((item) => item.type === 'expense')
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    results.push({ label: bucketLabel(locale, period, start), total });
  }

  return results;
}

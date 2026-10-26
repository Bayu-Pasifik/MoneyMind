import { Transaction } from '../types/transaction';
import { TFunction } from '../i18n/LocaleContext';

export type Period = 'week' | 'month' | '3months' | 'year';

export function getPeriodLabel(t: TFunction, period: Period): string {
  return t(`period.${period}`);
}

const PERIOD_DAYS: Record<Period, number> = {
  week: 7,
  month: 30,
  '3months': 90,
  year: 365,
};

function isWithinLastDays(iso: string, days: number, offsetDays = 0): boolean {
  const date = new Date(iso).getTime();
  const now = Date.now();
  const end = now - offsetDays * 24 * 60 * 60 * 1000;
  const start = end - days * 24 * 60 * 60 * 1000;
  return date > start && date <= end;
}

export function filterByPeriod(transactions: Transaction[], period: Period): Transaction[] {
  const days = PERIOD_DAYS[period];
  return transactions.filter((item) => isWithinLastDays(item.date, days));
}

export function filterByPreviousPeriod(transactions: Transaction[], period: Period): Transaction[] {
  const days = PERIOD_DAYS[period];
  return transactions.filter((item) => isWithinLastDays(item.date, days, days));
}

export type PeriodSummary = {
  spent: number;
  income: number;
  saved: number;
  count: number;
  spentDelta: number | null;
  incomeDelta: number | null;
};

function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function summarizePeriod(current: Transaction[], previous: Transaction[]): PeriodSummary {
  const spent = current.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const income = current.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const prevSpent = previous.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const prevIncome = previous.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return {
    spent,
    income,
    saved: income - spent,
    count: current.length,
    spentDelta: percentDelta(spent, prevSpent),
    incomeDelta: percentDelta(income, prevIncome),
  };
}

export type MerchantTotal = {
  merchant: string;
  total: number;
  count: number;
};

export function getTopMerchants(transactions: Transaction[], limit = 5): MerchantTotal[] {
  const totals = new Map<string, MerchantTotal>();
  for (const item of transactions) {
    if (item.type !== 'expense' || !item.merchant) continue;
    const existing = totals.get(item.merchant);
    if (existing) {
      existing.total += item.amount;
      existing.count += 1;
    } else {
      totals.set(item.merchant, { merchant: item.merchant, total: item.amount, count: 1 });
    }
  }
  return [...totals.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}

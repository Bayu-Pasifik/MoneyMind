import { Transaction } from '../types/transaction';
import { getCategoryBreakdown } from './analytics';
import { getCategoryLabel } from './categories';
import { formatCurrency } from './format';
import { filterByPeriod, filterByPreviousPeriod, summarizePeriod } from './period';
import { TFunction } from '../i18n/LocaleContext';

/**
 * Generates a single home-screen insight line from local transaction data.
 * No LLM/API is wired up; this mirrors the rule-based approach used by the
 * Chat assistant (see utils/chatBot.ts).
 */
export function generateHomeInsight(transactions: Transaction[], t: TFunction): string {
  const breakdown = getCategoryBreakdown(transactions);
  if (breakdown.length === 0) {
    return t('insight.empty');
  }

  const top = breakdown[0];
  if (top.ratio >= 0.4) {
    return t('insight.topCategory', {
      category: getCategoryLabel(t, top.category),
      percent: Math.round(top.ratio * 100),
      amount: formatCurrency(top.total),
    });
  }

  const totalExpense = breakdown.reduce((sum, item) => sum + item.total, 0);
  return t('insight.summary', {
    total: formatCurrency(totalExpense),
    count: breakdown.length,
    category: getCategoryLabel(t, top.category),
  });
}

export type WeeklyReport = {
  title: string;
  summary: string;
};

/**
 * Generates a this-week-vs-last-week summary from local transaction data,
 * same rule-based approach as generateHomeInsight — no LLM/API.
 */
export function generateWeeklyReport(transactions: Transaction[], t: TFunction): WeeklyReport {
  const thisWeek = filterByPeriod(transactions, 'week');
  const lastWeek = filterByPreviousPeriod(transactions, 'week');
  const { spent, income, saved, spentDelta } = summarizePeriod(thisWeek, lastWeek);

  const title = t('weeklyReport.title');

  if (thisWeek.length === 0) {
    return { title, summary: t('weeklyReport.empty') };
  }

  const breakdown = getCategoryBreakdown(thisWeek);
  const top = breakdown[0];
  const delta =
    spentDelta === null
      ? ''
      : spentDelta > 0
        ? t('weeklyReport.up', { percent: Math.round(spentDelta) })
        : spentDelta < 0
          ? t('weeklyReport.down', { percent: Math.round(Math.abs(spentDelta)) })
          : '';

  const topCategory = top
    ? t('weeklyReport.topCategory', { category: getCategoryLabel(t, top.category), amount: formatCurrency(top.total) })
    : '';

  return {
    title,
    summary: t('weeklyReport.summary', {
      spent: formatCurrency(spent),
      delta,
      income: formatCurrency(income),
      saved: formatCurrency(saved),
      topCategory,
    }),
  };
}

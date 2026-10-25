import { Transaction } from '../types/transaction';
import { getCategoryBreakdown } from './analytics';
import { CATEGORY_LABEL } from './categories';
import { formatCurrency } from './format';

/**
 * Generates a single home-screen insight line from local transaction data.
 * No LLM/API is wired up; this mirrors the rule-based approach used by the
 * Chat assistant (see utils/chatBot.ts).
 */
export function generateHomeInsight(transactions: Transaction[]): string {
  const breakdown = getCategoryBreakdown(transactions);
  if (breakdown.length === 0) {
    return 'Add a transaction or scan a receipt to start seeing insights here.';
  }

  const top = breakdown[0];
  if (top.ratio >= 0.4) {
    return `${CATEGORY_LABEL[top.category]} is ${Math.round(top.ratio * 100)}% of your spending (${formatCurrency(top.total)}). Want to set a budget for it?`;
  }

  const totalExpense = breakdown.reduce((sum, item) => sum + item.total, 0);
  return `You've spent ${formatCurrency(totalExpense)} across ${breakdown.length} categories. Your biggest is ${CATEGORY_LABEL[top.category]}.`;
}

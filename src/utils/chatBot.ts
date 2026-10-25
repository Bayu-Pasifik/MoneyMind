import { Transaction } from '../types/transaction';
import { getCategoryBreakdown } from './analytics';
import { CATEGORY_LABEL } from './categories';
import { formatCurrency } from './format';

/**
 * Rule-based assistant over local transaction data. No LLM/API is wired up;
 * swap this for a real backend call when one is available (see F6 notes).
 */
export function generateAssistantReply(question: string, transactions: Transaction[]): string {
  const normalized = question.toLowerCase();

  const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  if (/balance/.test(normalized)) {
    return `Your current balance is ${formatCurrency(totalIncome - totalExpense)}.`;
  }

  if (/income|earn/.test(normalized)) {
    return `You've recorded ${formatCurrency(totalIncome)} in income so far.`;
  }

  if (/spend|expense|spent/.test(normalized)) {
    const breakdown = getCategoryBreakdown(transactions);
    const top = breakdown[0];
    if (!top) {
      return "You haven't recorded any expenses yet.";
    }
    return `You've spent ${formatCurrency(totalExpense)} in total. Your biggest category is ${CATEGORY_LABEL[top.category]} at ${formatCurrency(top.total)} (${Math.round(top.ratio * 100)}%).`;
  }

  if (/budget/.test(normalized)) {
    return 'Keep an eye on your Home tab — the budget card shows how much of your monthly limit is left.';
  }

  if (/hi|hello|hey/.test(normalized)) {
    return "Hi! Ask me about your balance, spending, or top category.";
  }

  return "I can help with questions about your balance, income, spending and budget. Try asking \"How much did I spend?\"";
}

import { TransactionCategory } from '../types/transaction';

export type BudgetStatus = 'ok' | 'warn' | 'over';

export const CATEGORY_BUDGET_LIMITS: Partial<Record<TransactionCategory, number>> = {
  food: 1500000,
  transport: 600000,
  shopping: 1000000,
  entertainment: 400000,
};

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  if (spent > limit) return 'over';
  if (limit > 0 && spent / limit >= 0.8) return 'warn';
  return 'ok';
}

export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  ok: 'On track',
  warn: 'Near limit',
  over: 'Over budget',
};

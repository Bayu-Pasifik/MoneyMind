import { TransactionCategory } from '../types/transaction';

export type BudgetStatus = 'ok' | 'warn' | 'over' | 'none';

export const BUDGETABLE_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'other',
];

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  if (spent > limit) return 'over';
  if (limit > 0 && spent / limit >= 0.8) return 'warn';
  return 'ok';
}

export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  ok: 'On track',
  warn: 'Near limit',
  over: 'Over budget',
  none: 'No limit',
};

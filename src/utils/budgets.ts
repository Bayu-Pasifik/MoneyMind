import { TransactionCategory } from '../types/transaction';
import { TFunction } from '../i18n/LocaleContext';

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

export function getBudgetStatusLabel(t: TFunction, status: BudgetStatus): string {
  return t(`budgetStatus.${status}`);
}

import { TransactionCategory } from '../types/transaction';
import { TFunction } from '../i18n/LocaleContext';

export function getCategoryLabel(t: TFunction, category: TransactionCategory): string {
  return t(`category.${category}`);
}

export const ALL_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'salary',
  'transfer',
  'other',
];

export const CATEGORY_CHART_COLORS: Record<TransactionCategory, string> = {
  food: '#FF8A65',
  transport: '#4C6FFF',
  shopping: '#AB47BC',
  bills: '#26A69A',
  health: '#EC407A',
  entertainment: '#7E57C2',
  salary: '#1FAA59',
  transfer: '#5C6BC0',
  other: '#90A4AE',
};

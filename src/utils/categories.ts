import { TransactionCategory } from '../types/transaction';

export const CATEGORY_LABEL: Record<TransactionCategory, string> = {
  food: 'Food & Drink',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  health: 'Health',
  entertainment: 'Entertainment',
  salary: 'Salary',
  transfer: 'Transfer',
  other: 'Other',
};

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

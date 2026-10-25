import { TransactionCategory } from './transaction';

export type UpcomingTransaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  dueDate: string; // ISO 8601
  recurring: boolean; // when marked paid, reschedules +1 month instead of being removed
};

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'entertainment'
  | 'salary'
  | 'transfer'
  | 'other';

export type Transaction = {
  id: string;
  title: string;
  merchant?: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO 8601
  note?: string;
  receiptImageUri?: string;
  accountName?: string;
};

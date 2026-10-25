import { Transaction } from '../types/transaction';

export type ExportRange = 'thisMonth' | 'all';

export function filterByRange(transactions: Transaction[], range: ExportRange): Transaction[] {
  if (range === 'all') return transactions;

  const now = new Date();
  return transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
}

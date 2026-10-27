import { Transaction } from '../types/transaction';

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(
  transactions: Transaction[],
  accountNameFor: (item: Transaction) => string | undefined = (item) => item.accountName
): string {
  const header = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Account'];
  const rows = transactions.map((item) => [
    item.date,
    item.title,
    item.category,
    item.type,
    String(item.amount),
    accountNameFor(item) ?? '',
  ]);

  return [header, ...rows]
    .map((row) => row.map((field) => escapeCsvField(field)).join(','))
    .join('\n');
}

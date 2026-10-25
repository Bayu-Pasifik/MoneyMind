import { Transaction } from '../types/transaction';

export type TransactionSection = {
  title: string;
  data: Transaction[];
};

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function groupTransactionsByDay(transactions: Transaction[]): TransactionSection[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sections: TransactionSection[] = [];
  for (const transaction of sorted) {
    const title = dayLabel(transaction.date);
    const existing = sections.find((section) => section.title === title);
    if (existing) {
      existing.data.push(transaction);
    } else {
      sections.push({ title, data: [transaction] });
    }
  }
  return sections;
}

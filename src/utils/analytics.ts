import { Transaction, TransactionCategory } from '../types/transaction';

export type CategoryBreakdown = {
  category: TransactionCategory;
  total: number;
  ratio: number;
};

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenses = transactions.filter((item) => item.type === 'expense');
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  const totalsByCategory = new Map<TransactionCategory, number>();
  for (const item of expenses) {
    totalsByCategory.set(item.category, (totalsByCategory.get(item.category) ?? 0) + item.amount);
  }

  return [...totalsByCategory.entries()]
    .map(([category, categoryTotal]) => ({
      category,
      total: categoryTotal,
      ratio: total > 0 ? categoryTotal / total : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export type DayTotal = {
  label: string;
  total: number;
};

export function getLastNDaysExpenseTotals(transactions: Transaction[], days: number): DayTotal[] {
  const results: DayTotal[] = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);

    const total = transactions
      .filter((item) => item.type === 'expense')
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === day.getFullYear() &&
          itemDate.getMonth() === day.getMonth() &&
          itemDate.getDate() === day.getDate()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    results.push({
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day),
      total,
    });
  }

  return results;
}

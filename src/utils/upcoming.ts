import { UpcomingTransaction } from '../types/upcoming';

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const upcomingTransactions: UpcomingTransaction[] = [
  { id: 'up1', title: 'Netflix', amount: 54000, type: 'expense', category: 'entertainment', dueDate: daysFromNow(2) },
  { id: 'up2', title: 'Rent', amount: 2500000, type: 'expense', category: 'bills', dueDate: daysFromNow(5) },
  { id: 'up3', title: 'Freelance Salary', amount: 1500000, type: 'income', category: 'salary', dueDate: daysFromNow(6) },
  { id: 'up4', title: 'Spotify', amount: 54990, type: 'expense', category: 'entertainment', dueDate: daysFromNow(9) },
];

export function isDueSoon(dueDate: string, withinDays = 3): boolean {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= withinDays;
}

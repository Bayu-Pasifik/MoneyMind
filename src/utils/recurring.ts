import { Transaction } from '../types/transaction';
import { UpcomingTransaction } from '../types/upcoming';

/** Safety cap so a corrupt or very old dueDate can never post an unbounded number of transactions. */
export const MAX_CATCH_UP_CYCLES = 24;

/** Adds months to an ISO date, clamping to the last day of the target month (Jan 31 + 1 => Feb 28/29). */
export function addMonthsClamped(iso: string, months: number): string {
  const base = new Date(iso);
  const day = base.getDate();
  const target = new Date(base.getTime());
  target.setDate(1);
  target.setMonth(target.getMonth() + months);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return target.toISOString();
}

/** Deterministic id: the same item + cycle always maps to the same transaction, so re-runs cannot duplicate it. */
export function recurringTransactionId(itemId: string, dueDate: string): string {
  return `recurring-${itemId}-${dueDate}`;
}

export type RecurringResult = {
  transactions: Transaction[];
  nextDueDate: string;
};

/**
 * Builds one transaction per missed cycle of a recurring item and the next due date (always in the future).
 * Returns null when nothing is due.
 */
export function collectDueOccurrences(
  item: UpcomingTransaction,
  now: Date = new Date()
): RecurringResult | null {
  if (!item.recurring) return null;
  const nowMs = now.getTime();
  if (Number.isNaN(new Date(item.dueDate).getTime()) || new Date(item.dueDate).getTime() > nowMs) {
    return null;
  }

  const transactions: Transaction[] = [];
  let cycle = 0;
  let due = item.dueDate;
  while (new Date(due).getTime() <= nowMs && cycle < MAX_CATCH_UP_CYCLES) {
    transactions.push({
      id: recurringTransactionId(item.id, due),
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      date: due,
      accountId: item.accountId,
      note: 'Recurring',
      source: 'manual',
    });
    cycle += 1;
    // Always offset from the original dueDate so a clamped month (Feb 28) does not drag later months off the anchor day.
    due = addMonthsClamped(item.dueDate, cycle);
  }

  // Hit the cap: skip the remaining backlog by jumping to the first future cycle.
  while (new Date(due).getTime() <= nowMs) {
    cycle += 1;
    due = addMonthsClamped(item.dueDate, cycle);
  }

  return { transactions, nextDueDate: due };
}

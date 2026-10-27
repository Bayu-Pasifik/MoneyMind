import { describe, expect, it } from 'vitest';
import {
  addMonthsClamped,
  collectDueOccurrences,
  MAX_CATCH_UP_CYCLES,
  recurringTransactionId,
} from '../recurring';
import { UpcomingTransaction } from '../../types/upcoming';

function item(partial: Partial<UpcomingTransaction>): UpcomingTransaction {
  return {
    id: 'up1',
    title: 'Rent',
    amount: 2500000,
    type: 'expense',
    category: 'bills',
    dueDate: new Date(2026, 0, 15, 9).toISOString(),
    recurring: true,
    ...partial,
  };
}

describe('addMonthsClamped', () => {
  it('clamps Jan 31 to the end of February', () => {
    const result = new Date(addMonthsClamped(new Date(2026, 0, 31, 9).toISOString(), 1));
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('keeps the anchor day when offset from the original date', () => {
    const jan31 = new Date(2026, 0, 31, 9).toISOString();
    const march = new Date(addMonthsClamped(jan31, 2));
    expect(march.getMonth()).toBe(2);
    expect(march.getDate()).toBe(31);
  });

  it('rolls over the year', () => {
    const result = new Date(addMonthsClamped(new Date(2026, 11, 10, 9).toISOString(), 1));
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
  });
});

describe('collectDueOccurrences', () => {
  it('returns null when not due yet', () => {
    expect(collectDueOccurrences(item({}), new Date(2026, 0, 1))).toBeNull();
  });

  it('returns null for non-recurring items', () => {
    expect(collectDueOccurrences(item({ recurring: false }), new Date(2026, 5, 1))).toBeNull();
  });

  it('returns null for an invalid dueDate', () => {
    expect(collectDueOccurrences(item({ dueDate: 'nope' }), new Date(2026, 5, 1))).toBeNull();
  });

  it('posts one transaction when a single cycle is due', () => {
    const result = collectDueOccurrences(item({}), new Date(2026, 0, 20))!;
    expect(result.transactions).toHaveLength(1);
    expect(new Date(result.nextDueDate).getMonth()).toBe(1);
  });

  it('catches up every missed cycle with distinct ids', () => {
    const result = collectDueOccurrences(item({}), new Date(2026, 3, 20))!;
    expect(result.transactions).toHaveLength(4); // Jan, Feb, Mar, Apr
    expect(new Set(result.transactions.map((t) => t.id)).size).toBe(4);
    expect(new Date(result.nextDueDate).getMonth()).toBe(4);
  });

  it('is idempotent: re-running on the advanced item yields nothing', () => {
    const now = new Date(2026, 3, 20);
    const first = collectDueOccurrences(item({}), now)!;
    expect(collectDueOccurrences(item({ dueDate: first.nextDueDate }), now)).toBeNull();
  });

  it('produces the same ids when the same cycle is recomputed (crash retry)', () => {
    const now = new Date(2026, 1, 20);
    const a = collectDueOccurrences(item({}), now)!;
    const b = collectDueOccurrences(item({}), now)!;
    expect(a.transactions.map((t) => t.id)).toEqual(b.transactions.map((t) => t.id));
    expect(a.transactions[0].id).toBe(recurringTransactionId('up1', item({}).dueDate));
  });

  it('copies item fields and dates each transaction on its own due date', () => {
    const [tx] = collectDueOccurrences(item({}), new Date(2026, 0, 20))!.transactions;
    expect(tx).toMatchObject({ title: 'Rent', amount: 2500000, type: 'expense', category: 'bills', date: item({}).dueDate });
  });

  it('caps the backlog and still lands on a future date', () => {
    const now = new Date(2036, 0, 1);
    const result = collectDueOccurrences(item({}), now)!;
    expect(result.transactions).toHaveLength(MAX_CATCH_UP_CYCLES);
    expect(new Date(result.nextDueDate).getTime()).toBeGreaterThan(now.getTime());
  });
});

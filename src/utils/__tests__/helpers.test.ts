import { describe, expect, it } from 'vitest';
import { formatAmountInput, parseAmountInput } from '../format';
import { fromDateInputValue, toDateInputValue } from '../dateInput';
import { transactionsToCsv } from '../csv';
import { getBudgetStatus } from '../budgets';
import { filterByRange } from '../dateRange';
import { getTopMerchants, summarizePeriod } from '../period';
import { Transaction } from '../../types/transaction';

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: 'x',
    title: 'T',
    amount: 1000,
    type: 'expense',
    category: 'other',
    date: '2026-10-01T00:00:00.000Z',
    source: 'manual',
    ...partial,
  };
}

describe('format amount helpers', () => {
  it('groups thousands with Rp prefix', () => {
    expect(formatAmountInput('2000000')).toBe('Rp 2.000.000');
  });
  it('omits prefix when asked', () => {
    expect(formatAmountInput('1500', false)).toBe('1.500');
  });
  it('strips non-digits and leading zeros', () => {
    expect(formatAmountInput('Rp 0012a34')).toBe('Rp 1.234');
  });
  it('returns empty for no digits', () => {
    expect(formatAmountInput('abc')).toBe('');
  });
  it('parseAmountInput round-trips', () => {
    expect(parseAmountInput('Rp 2.000.000')).toBe(2000000);
    expect(parseAmountInput('')).toBe(0);
  });
});

describe('dateInput', () => {
  it('toDateInputValue slices ISO date', () => {
    expect(toDateInputValue('2026-10-27T05:00:00.000Z')).toBe('2026-10-27');
  });
  it('fromDateInputValue rejects bad format', () => {
    expect(fromDateInputValue('27-10-2026')).toBeNull();
    expect(fromDateInputValue('2026-13-45')).toBeNull();
  });
  it('fromDateInputValue returns ISO string for valid date', () => {
    const iso = fromDateInputValue(' 2026-10-27 ');
    expect(iso).not.toBeNull();
    expect(new Date(iso as string).getTime()).not.toBeNaN();
  });
});

describe('transactionsToCsv', () => {
  it('writes header and rows', () => {
    const csv = transactionsToCsv([tx({ title: 'Kopi', accountName: 'BCA' })]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('Date,Title,Category,Type,Amount,Account');
    expect(row).toBe('2026-10-01T00:00:00.000Z,Kopi,other,expense,1000,BCA');
  });
  it('escapes commas, quotes and newlines', () => {
    const csv = transactionsToCsv([tx({ title: 'A, "B"\nC' })]);
    expect(csv).toContain('"A, ""B""\nC"');
  });
});

describe('getBudgetStatus', () => {
  it('ok under 80%', () => expect(getBudgetStatus(79, 100)).toBe('ok'));
  it('warn at 80%', () => expect(getBudgetStatus(80, 100)).toBe('warn'));
  it('warn at exactly limit', () => expect(getBudgetStatus(100, 100)).toBe('warn'));
  it('over above limit', () => expect(getBudgetStatus(101, 100)).toBe('over'));
  it('ok when limit is 0 and nothing spent', () => expect(getBudgetStatus(0, 0)).toBe('ok'));
});

describe('filterByRange', () => {
  const now = new Date();
  const thisMonth = tx({ id: 'a', date: now.toISOString() });
  const old = tx({ id: 'b', date: new Date(now.getFullYear() - 1, 0, 15).toISOString() });
  it('all returns everything', () => {
    expect(filterByRange([thisMonth, old], 'all')).toHaveLength(2);
  });
  it('thisMonth filters out other months', () => {
    expect(filterByRange([thisMonth, old], 'thisMonth').map((t) => t.id)).toEqual(['a']);
  });
});

describe('period helpers', () => {
  it('summarizePeriod totals and deltas', () => {
    const current = [tx({ amount: 200 }), tx({ type: 'income', amount: 1000 })];
    const previous = [tx({ amount: 100 })];
    const s = summarizePeriod(current, previous);
    expect(s).toMatchObject({ spent: 200, income: 1000, saved: 800, count: 2, spentDelta: 100 });
    expect(s.incomeDelta).toBeNull();
  });
  it('getTopMerchants aggregates expenses, sorts, limits', () => {
    const list = [
      tx({ merchant: 'A', amount: 100 }),
      tx({ merchant: 'A', amount: 50 }),
      tx({ merchant: 'B', amount: 500 }),
      tx({ merchant: 'C', amount: 10, type: 'income' }),
      tx({ amount: 999 }),
    ];
    expect(getTopMerchants(list)).toEqual([
      { merchant: 'B', total: 500, count: 1 },
      { merchant: 'A', total: 150, count: 2 },
    ]);
    expect(getTopMerchants(list, 1)).toHaveLength(1);
  });
});

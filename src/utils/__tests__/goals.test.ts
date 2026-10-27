import { describe, expect, it } from 'vitest';
import { GoalEntry } from '../../types/goal';
import { computeAccountBalances, DEFAULT_ACCOUNT_ID, sumBalances } from '../accounts';
import { computeGoalSaved, goalProgress, sumGoalEntries } from '../goals';

function entry(overrides: Partial<GoalEntry>): GoalEntry {
  return {
    id: 'e',
    goalId: 'g1',
    accountId: 'bca',
    amount: 100,
    date: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computeGoalSaved', () => {
  it('sums deposits minus withdrawals per goal', () => {
    const saved = computeGoalSaved(
      ['g1', 'g2'],
      [entry({ amount: 500 }), entry({ amount: -200 }), entry({ goalId: 'g2', amount: 50 })]
    );
    expect(saved).toEqual({ g1: 300, g2: 50 });
  });

  it('starts every goal at zero and ignores entries of unknown goals', () => {
    expect(computeGoalSaved(['g1'], [entry({ goalId: 'gone', amount: 999 })])).toEqual({ g1: 0 });
  });
});

describe('sumGoalEntries', () => {
  it('returns the net amount held in goals', () => {
    expect(sumGoalEntries([entry({ amount: 500 }), entry({ amount: -150 })])).toBe(350);
  });
});

describe('goalProgress', () => {
  it('reports ratio and remaining amount', () => {
    expect(goalProgress(250, 1000)).toEqual({ ratio: 0.25, remaining: 750, reached: false });
  });

  it('clamps when the goal is overfilled', () => {
    expect(goalProgress(1500, 1000)).toEqual({ ratio: 1, remaining: 0, reached: true });
  });

  it('handles a zero target without dividing by zero', () => {
    expect(goalProgress(0, 0)).toEqual({ ratio: 0, remaining: 0, reached: false });
  });
});

describe('account balances with goal entries', () => {
  const accounts = [
    { id: DEFAULT_ACCOUNT_ID, name: 'Cash', openingBalance: 1000 },
    { id: 'bca', name: 'BCA', openingBalance: 5000 },
  ];

  it('deducts deposits from the source account and restores withdrawals', () => {
    const balances = computeAccountBalances(
      accounts,
      [],
      [],
      [entry({ accountId: 'bca', amount: 2000 }), entry({ accountId: 'bca', amount: -500 })]
    );
    expect(balances.bca).toBe(5000 - 2000 + 500);
  });

  it('charges entries of a deleted account to the default account', () => {
    const balances = computeAccountBalances(accounts, [], [], [entry({ accountId: 'gone', amount: 300 })]);
    expect(balances[DEFAULT_ACCOUNT_ID]).toBe(700);
  });

  it('keeps total assets unchanged once goal money is added back', () => {
    const entries = [entry({ accountId: 'bca', amount: 2000 })];
    const balances = computeAccountBalances(accounts, [], [], entries);
    expect(sumBalances(balances) + sumGoalEntries(entries)).toBe(6000);
  });
});

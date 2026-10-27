import { describe, expect, it } from 'vitest';
import { Transaction } from '../../types/transaction';
import {
  computeAccountBalances,
  DEFAULT_ACCOUNT_ID,
  resolveAccountId,
  SEED_ACCOUNTS,
  sumBalances,
} from '../accounts';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'x',
    title: 't',
    amount: 100,
    type: 'expense',
    category: 'food',
    date: '2026-01-01T00:00:00.000Z',
    source: 'manual',
    ...overrides,
  };
}

describe('computeAccountBalances', () => {
  const accounts = [
    { id: DEFAULT_ACCOUNT_ID, name: 'Cash', openingBalance: 1000 },
    { id: 'bca', name: 'BCA', openingBalance: 5000 },
  ];

  it('applies opening balance, income, expense and adjustments per account', () => {
    const balances = computeAccountBalances(
      accounts,
      [
        tx({ accountId: 'bca', type: 'income', amount: 2000 }),
        tx({ accountId: 'bca', type: 'expense', amount: 500 }),
      ],
      [{ id: 'a1', accountId: 'bca', amount: -300, date: '2026-01-02T00:00:00.000Z' }]
    );
    expect(balances.bca).toBe(5000 + 2000 - 500 - 300);
    expect(balances[DEFAULT_ACCOUNT_ID]).toBe(1000);
  });

  it('assigns transactions without an account to the default account', () => {
    const balances = computeAccountBalances(accounts, [tx({ amount: 250 })], []);
    expect(balances[DEFAULT_ACCOUNT_ID]).toBe(750);
  });

  it('falls back to the default account when the account was deleted', () => {
    const balances = computeAccountBalances(accounts, [tx({ accountId: 'gone', amount: 100 })], []);
    expect(balances[DEFAULT_ACCOUNT_ID]).toBe(900);
  });

  it('ignores adjustments for unknown accounts', () => {
    const balances = computeAccountBalances(
      accounts,
      [],
      [{ id: 'a1', accountId: 'gone', amount: -999, date: '2026-01-02T00:00:00.000Z' }]
    );
    expect(sumBalances(balances)).toBe(6000);
  });
});

describe('resolveAccountId', () => {
  it('returns the first account when the default is missing', () => {
    expect(resolveAccountId(undefined, [{ id: 'bca', name: 'BCA', openingBalance: 0 }])).toBe('bca');
  });

  it('returns undefined with no accounts', () => {
    expect(resolveAccountId('x', [])).toBeUndefined();
  });
});

describe('SEED_ACCOUNTS', () => {
  it('contains the five starting accounts including the default', () => {
    expect(SEED_ACCOUNTS.map((account) => account.name)).toEqual(['Cash', 'BCA', 'BNI', 'BRI 1', 'BRI 2']);
    expect(SEED_ACCOUNTS.some((account) => account.id === DEFAULT_ACCOUNT_ID)).toBe(true);
  });
});

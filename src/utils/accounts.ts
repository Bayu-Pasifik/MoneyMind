import { Account, AccountAdjustment } from '../types/account';
import { GoalEntry } from '../types/goal';
import { Transaction } from '../types/transaction';

/** Transactions without an accountId (older rows, notification capture) belong to this account. */
export const DEFAULT_ACCOUNT_ID = 'acc-cash';

export const SEED_ACCOUNTS: Account[] = [
  { id: DEFAULT_ACCOUNT_ID, name: 'Cash', openingBalance: 0 },
  { id: 'acc-bca', name: 'BCA', openingBalance: 0 },
  { id: 'acc-bni', name: 'BNI', openingBalance: 0 },
  { id: 'acc-bri-1', name: 'BRI 1', openingBalance: 0 },
  { id: 'acc-bri-2', name: 'BRI 2', openingBalance: 0 },
];

/** Resolves a transaction's account id, falling back to the default account when unset or deleted. */
export function resolveAccountId(accountId: string | undefined, accounts: Account[]): string | undefined {
  if (accountId && accounts.some((account) => account.id === accountId)) return accountId;
  return accounts.find((account) => account.id === DEFAULT_ACCOUNT_ID)?.id ?? accounts[0]?.id;
}

/** Balance per account id: opening balance + income - expense + adjustments - money moved into goals. */
export function computeAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
  adjustments: AccountAdjustment[],
  goalEntries: GoalEntry[] = []
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const account of accounts) {
    balances[account.id] = account.openingBalance;
  }
  for (const transaction of transactions) {
    const id = resolveAccountId(transaction.accountId, accounts);
    if (id === undefined) continue;
    balances[id] += transaction.type === 'income' ? transaction.amount : -transaction.amount;
  }
  for (const adjustment of adjustments) {
    if (adjustment.accountId in balances) {
      balances[adjustment.accountId] += adjustment.amount;
    }
  }
  for (const entry of goalEntries) {
    const id = resolveAccountId(entry.accountId, accounts);
    if (id === undefined) continue;
    balances[id] -= entry.amount;
  }
  return balances;
}

export function sumBalances(balances: Record<string, number>): number {
  return Object.values(balances).reduce((sum, value) => sum + value, 0);
}

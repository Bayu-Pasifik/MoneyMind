import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Account, AccountAdjustment } from '../types/account';
import { computeAccountBalances, DEFAULT_ACCOUNT_ID, resolveAccountId, SEED_ACCOUNTS, sumBalances } from '../utils/accounts';
import { useTransactions } from './TransactionsContext';
import { useGoals } from './GoalsContext';
import {
  deleteAccountInDb,
  deleteAdjustment,
  getAllAccounts,
  getAllAdjustments,
  insertAccount,
  insertAccountsIfEmpty,
  insertAdjustment,
  updateAccountInDb,
} from './database';

type AccountsContextValue = {
  accounts: Account[];
  adjustments: AccountAdjustment[];
  balances: Record<string, number>;
  /** Accounts total plus money held in goals. */
  totalAssets: number;
  /** Sum of account balances only (money not set aside in goals). */
  accountsTotal: number;
  /** Money set aside in goals. */
  goalsTotal: number;
  getById: (id: string) => Account | undefined;
  /** Account a transaction/upcoming item counts toward (falls back to the default account). */
  resolveId: (accountId: string | undefined) => string | undefined;
  addAccount: (name: string, openingBalance: number) => void;
  updateAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  /** Adds a signed correction to an account balance; negative reduces it. */
  addAdjustment: (accountId: string, amount: number) => void;
  removeAdjustment: (id: string) => void;
};

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const { transactions } = useTransactions();
  const { entries, totalSaved: goalsTotal } = useGoals();
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [adjustments, setAdjustments] = useState<AccountAdjustment[]>([]);

  useEffect(() => {
    (async () => {
      await insertAccountsIfEmpty(SEED_ACCOUNTS);
      setAccounts(await getAllAccounts());
      setAdjustments(await getAllAdjustments());
    })().catch((error) => console.error('[db] failed to load accounts', error));
  }, []);

  const addAccount = (name: string, openingBalance: number) => {
    const account: Account = { id: `acc-${Date.now()}`, name, openingBalance };
    const sortOrder = accounts.length;
    setAccounts((prev) => [...prev, account]);
    insertAccount(account, sortOrder).catch((error) => console.error('[db] account insert failed', error));
  };

  const updateAccount = (account: Account) => {
    setAccounts((prev) => prev.map((item) => (item.id === account.id ? account : item)));
    updateAccountInDb(account).catch((error) => console.error('[db] account update failed', error));
  };

  const removeAccount = (id: string) => {
    if (id === DEFAULT_ACCOUNT_ID) return;
    setAccounts((prev) => prev.filter((item) => item.id !== id));
    setAdjustments((prev) => prev.filter((item) => item.accountId !== id));
    deleteAccountInDb(id).catch((error) => console.error('[db] account delete failed', error));
  };

  const addAdjustment = (accountId: string, amount: number) => {
    if (amount === 0) return;
    const adjustment: AccountAdjustment = {
      id: `adj-${Date.now()}`,
      accountId,
      amount,
      date: new Date().toISOString(),
    };
    setAdjustments((prev) => [adjustment, ...prev]);
    insertAdjustment(adjustment).catch((error) => console.error('[db] adjustment insert failed', error));
  };

  const removeAdjustment = (id: string) => {
    setAdjustments((prev) => prev.filter((item) => item.id !== id));
    deleteAdjustment(id).catch((error) => console.error('[db] adjustment delete failed', error));
  };

  const balances = useMemo(
    () => computeAccountBalances(accounts, transactions, adjustments, entries),
    [accounts, transactions, adjustments, entries]
  );
  const accountsTotal = useMemo(() => sumBalances(balances), [balances]);
  // Money in goals still counts as an asset; it just isn't spendable from an account.
  const totalAssets = accountsTotal + goalsTotal;

  const value = useMemo<AccountsContextValue>(
    () => ({
      accounts,
      adjustments,
      balances,
      totalAssets,
      accountsTotal,
      goalsTotal,
      getById: (id) => accounts.find((item) => item.id === id),
      resolveId: (accountId) => resolveAccountId(accountId, accounts),
      addAccount,
      updateAccount,
      removeAccount,
      addAdjustment,
      removeAdjustment,
    }),
    [accounts, adjustments, balances, totalAssets, accountsTotal, goalsTotal]
  );

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts() {
  const ctx = useContext(AccountsContext);
  if (!ctx) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return ctx;
}

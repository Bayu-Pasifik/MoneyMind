import React, { createContext, useContext, useMemo, useState } from 'react';
import { Transaction } from '../types/transaction';

const seedTransactions: Transaction[] = [
  {
    id: 't1',
    title: 'Coffee Bean Co.',
    merchant: 'Coffee Bean Co.',
    amount: 45000,
    type: 'expense',
    category: 'food',
    date: new Date().toISOString(),
    accountName: 'Cash Wallet',
  },
  {
    id: 't2',
    title: 'Monthly Salary',
    merchant: 'PT Maju Jaya',
    amount: 8500000,
    type: 'income',
    category: 'salary',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    accountName: 'Main Bank',
  },
  {
    id: 't3',
    title: 'Electricity Bill',
    merchant: 'PLN',
    amount: 320000,
    type: 'expense',
    category: 'bills',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    accountName: 'Main Bank',
  },
  {
    id: 't4',
    title: 'Grab Ride',
    merchant: 'Grab',
    amount: 28000,
    type: 'expense',
    category: 'transport',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    accountName: 'Cash Wallet',
  },
  {
    id: 't5',
    title: 'Movie Night',
    merchant: 'CGV Cinemas',
    amount: 95000,
    type: 'expense',
    category: 'entertainment',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    accountName: 'Cash Wallet',
  },
];

type TransactionsContextValue = {
  transactions: Transaction[];
  getById: (id: string) => Transaction | undefined;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  balance: number;
  totalIncome: number;
  totalExpense: number;
};

const TransactionsContext = createContext<TransactionsContextValue | undefined>(
  undefined
);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const getById = (id: string) => transactions.find((item) => item.id === id);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  const value = useMemo(
    () => ({
      transactions,
      getById,
      addTransaction,
      removeTransaction,
      balance,
      totalIncome,
      totalExpense,
    }),
    [transactions, balance, totalIncome, totalExpense]
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return ctx;
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { Transaction, TransactionCategory } from '../types/transaction';
import { NOTIFICATION_TRANSACTION_ADDED_EVENT } from '../utils/events';
import {
  deleteTransaction,
  getAllTransactions,
  initDatabase,
  insertTransaction,
  insertTransactionsIfEmpty,
  updateTransactionCategoryInDb,
  updateTransactionInDb,
} from './database';

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
    source: 'notification',
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
    source: 'manual',
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
    source: 'notification',
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
    source: 'notification',
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
    source: 'manual',
  },
];

type TransactionsContextValue = {
  transactions: Transaction[];
  isReady: boolean;
  getById: (id: string) => Transaction | undefined;
  refresh: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  updateTransactionCategory: (id: string, category: TransactionCategory) => void;
  balance: number;
  totalIncome: number;
  totalExpense: number;
};

const TransactionsContext = createContext<TransactionsContextValue | undefined>(
  undefined
);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await insertTransactionsIfEmpty(seedTransactions);
      const loaded = await getAllTransactions();
      setTransactions(loaded);
      setIsReady(true);
    })().catch((error) => {
      console.error('[db] failed to load transactions', error);
      setTransactions(seedTransactions);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(NOTIFICATION_TRANSACTION_ADDED_EVENT, () => {
      getAllTransactions()
        .then(setTransactions)
        .catch((error) => console.error('[db] failed to refresh after notification capture', error));
    });
    return () => subscription.remove();
  }, []);

  const refresh = async () => {
    try {
      setTransactions(await getAllTransactions());
    } catch (error) {
      console.error('[db] failed to refresh transactions', error);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    insertTransaction(transaction).catch((error) => console.error('[db] insert failed', error));
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    deleteTransaction(id).catch((error) => console.error('[db] delete failed', error));
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === transaction.id ? transaction : item))
    );
    updateTransactionInDb(transaction).catch((error) =>
      console.error('[db] update failed', error)
    );
  };

  const updateTransactionCategory = (id: string, category: TransactionCategory) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
    updateTransactionCategoryInDb(id, category).catch((error) =>
      console.error('[db] category update failed', error)
    );
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
      isReady,
      getById,
      refresh,
      addTransaction,
      removeTransaction,
      updateTransaction,
      updateTransactionCategory,
      balance,
      totalIncome,
      totalExpense,
    }),
    [transactions, isReady, balance, totalIncome, totalExpense]
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

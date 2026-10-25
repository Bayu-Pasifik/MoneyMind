import React, { createContext, useContext, useEffect, useState } from 'react';
import { UpcomingTransaction } from '../types/upcoming';
import {
  deleteUpcoming,
  getAllUpcoming,
  initDatabase,
  insertUpcoming,
  insertUpcomingIfEmpty,
  updateUpcomingInDb,
} from './database';

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const seedUpcoming: UpcomingTransaction[] = [
  { id: 'up1', title: 'Netflix', amount: 54000, type: 'expense', category: 'entertainment', dueDate: daysFromNow(2), recurring: true },
  { id: 'up2', title: 'Rent', amount: 2500000, type: 'expense', category: 'bills', dueDate: daysFromNow(5), recurring: true },
  { id: 'up3', title: 'Freelance Salary', amount: 1500000, type: 'income', category: 'salary', dueDate: daysFromNow(6), recurring: false },
  { id: 'up4', title: 'Spotify', amount: 54990, type: 'expense', category: 'entertainment', dueDate: daysFromNow(9), recurring: true },
];

type UpcomingContextValue = {
  items: UpcomingTransaction[];
  isReady: boolean;
  getById: (id: string) => UpcomingTransaction | undefined;
  addItem: (item: UpcomingTransaction) => void;
  updateItem: (item: UpcomingTransaction) => void;
  removeItem: (id: string) => void;
  rescheduleItem: (id: string) => void;
};

const UpcomingContext = createContext<UpcomingContextValue | undefined>(undefined);

export function UpcomingProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<UpcomingTransaction[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await insertUpcomingIfEmpty(seedUpcoming);
      const loaded = await getAllUpcoming();
      setItems(loaded);
      setIsReady(true);
    })().catch((error) => {
      console.error('[db] failed to load upcoming', error);
      setItems(seedUpcoming);
      setIsReady(true);
    });
  }, []);

  const addItem = (item: UpcomingTransaction) => {
    setItems((prev) => [...prev, item].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
    insertUpcoming(item).catch((error) => console.error('[db] upcoming insert failed', error));
  };

  const updateItem = (item: UpcomingTransaction) => {
    setItems((prev) =>
      prev.map((existing) => (existing.id === item.id ? item : existing)).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    );
    updateUpcomingInDb(item).catch((error) => console.error('[db] upcoming update failed', error));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    deleteUpcoming(id).catch((error) => console.error('[db] upcoming delete failed', error));
  };

  /** Pushes a recurring item's due date forward by one month (used after marking it paid). */
  const rescheduleItem = (id: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (!existing) return prev;
      const nextDue = new Date(existing.dueDate);
      nextDue.setMonth(nextDue.getMonth() + 1);
      const updated = { ...existing, dueDate: nextDue.toISOString() };
      updateUpcomingInDb(updated).catch((error) => console.error('[db] upcoming reschedule failed', error));
      return prev.map((item) => (item.id === id ? updated : item)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    });
  };

  const getById = (id: string) => items.find((item) => item.id === id);

  return (
    <UpcomingContext.Provider value={{ items, isReady, getById, addItem, updateItem, removeItem, rescheduleItem }}>
      {children}
    </UpcomingContext.Provider>
  );
}

export function useUpcoming() {
  const ctx = useContext(UpcomingContext);
  if (!ctx) {
    throw new Error('useUpcoming must be used within an UpcomingProvider');
  }
  return ctx;
}

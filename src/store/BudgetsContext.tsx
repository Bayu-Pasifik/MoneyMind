import React, { createContext, useContext, useEffect, useState } from 'react';
import { TransactionCategory } from '../types/transaction';
import { getAllBudgets, insertBudgetsIfEmpty, setBudgetLimit as setBudgetLimitInDb, deleteBudget } from './database';

const DEFAULT_BUDGET_LIMITS: Partial<Record<TransactionCategory, number>> = {
  food: 1500000,
  transport: 600000,
  shopping: 1000000,
  entertainment: 400000,
};

type BudgetsContextValue = {
  budgets: Partial<Record<TransactionCategory, number>>;
  isReady: boolean;
  setLimit: (category: TransactionCategory, limit: number) => void;
  removeLimit: (category: TransactionCategory) => void;
};

const BudgetsContext = createContext<BudgetsContextValue | undefined>(undefined);

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Partial<Record<TransactionCategory, number>>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await insertBudgetsIfEmpty(DEFAULT_BUDGET_LIMITS);
      const loaded = await getAllBudgets();
      setBudgets(loaded as Partial<Record<TransactionCategory, number>>);
      setIsReady(true);
    })().catch((error) => {
      console.error('[db] failed to load budgets', error);
      setBudgets(DEFAULT_BUDGET_LIMITS);
      setIsReady(true);
    });
  }, []);

  const setLimit = (category: TransactionCategory, limit: number) => {
    setBudgets((prev) => ({ ...prev, [category]: limit }));
    setBudgetLimitInDb(category, limit).catch((error) =>
      console.error('[db] budget save failed', error)
    );
  };

  const removeLimit = (category: TransactionCategory) => {
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
    deleteBudget(category).catch((error) => console.error('[db] budget delete failed', error));
  };

  return (
    <BudgetsContext.Provider value={{ budgets, isReady, setLimit, removeLimit }}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const ctx = useContext(BudgetsContext);
  if (!ctx) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return ctx;
}

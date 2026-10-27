import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Goal, GoalEntry } from '../types/goal';
import { computeGoalSaved, sumGoalEntries } from '../utils/goals';
import {
  deleteGoalInDb,
  getAllGoalEntries,
  getAllGoals,
  insertGoal,
  insertGoalEntry,
  updateGoalInDb,
} from './database';

type GoalsContextValue = {
  goals: Goal[];
  entries: GoalEntry[];
  /** Saved amount per goal id. */
  saved: Record<string, number>;
  /** Total money sitting in all goals. */
  totalSaved: number;
  getById: (id: string) => Goal | undefined;
  addGoal: (name: string, targetAmount: number) => void;
  updateGoal: (goal: Goal) => void;
  /** Deletes the goal; its money returns to the accounts it came from. */
  removeGoal: (id: string) => void;
  /** Moves money between an account and a goal; positive deposits, negative withdraws. */
  addEntry: (goalId: string, accountId: string, amount: number) => void;
};

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<GoalEntry[]>([]);

  useEffect(() => {
    (async () => {
      setGoals(await getAllGoals());
      setEntries(await getAllGoalEntries());
    })().catch((error) => console.error('[db] failed to load goals', error));
  }, []);

  const addGoal = (name: string, targetAmount: number) => {
    const goal: Goal = { id: `goal-${Date.now()}`, name, targetAmount };
    const sortOrder = goals.length;
    setGoals((prev) => [...prev, goal]);
    insertGoal(goal, sortOrder).catch((error) => console.error('[db] goal insert failed', error));
  };

  const updateGoal = (goal: Goal) => {
    setGoals((prev) => prev.map((item) => (item.id === goal.id ? goal : item)));
    updateGoalInDb(goal).catch((error) => console.error('[db] goal update failed', error));
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((item) => item.id !== id));
    setEntries((prev) => prev.filter((item) => item.goalId !== id));
    deleteGoalInDb(id).catch((error) => console.error('[db] goal delete failed', error));
  };

  const addEntry = (goalId: string, accountId: string, amount: number) => {
    if (amount === 0) return;
    const entry: GoalEntry = {
      id: `ge-${Date.now()}`,
      goalId,
      accountId,
      amount,
      date: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    insertGoalEntry(entry).catch((error) => console.error('[db] goal entry insert failed', error));
  };

  const saved = useMemo(
    () =>
      computeGoalSaved(
        goals.map((goal) => goal.id),
        entries
      ),
    [goals, entries]
  );
  const totalSaved = useMemo(() => sumGoalEntries(entries), [entries]);

  const value = useMemo<GoalsContextValue>(
    () => ({
      goals,
      entries,
      saved,
      totalSaved,
      getById: (id) => goals.find((item) => item.id === id),
      addGoal,
      updateGoal,
      removeGoal,
      addEntry,
    }),
    [goals, entries, saved, totalSaved]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return ctx;
}

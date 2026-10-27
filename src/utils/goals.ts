import { GoalEntry } from '../types/goal';

/** Saved amount per goal id: sum of its deposits minus withdrawals. */
export function computeGoalSaved(goalIds: string[], entries: GoalEntry[]): Record<string, number> {
  const saved: Record<string, number> = {};
  for (const id of goalIds) {
    saved[id] = 0;
  }
  for (const entry of entries) {
    if (entry.goalId in saved) {
      saved[entry.goalId] += entry.amount;
    }
  }
  return saved;
}

/** Total money currently sitting in goals. */
export function sumGoalEntries(entries: GoalEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}

export type GoalProgress = {
  /** 0..1, clamped. */
  ratio: number;
  /** Amount still missing; never negative. */
  remaining: number;
  reached: boolean;
};

export function goalProgress(saved: number, target: number): GoalProgress {
  const remaining = Math.max(target - saved, 0);
  const ratio = target > 0 ? Math.min(Math.max(saved / target, 0), 1) : 0;
  return { ratio, remaining, reached: target > 0 && saved >= target };
}

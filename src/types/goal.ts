export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
};

/** Money moved between an account and a goal. Positive = deposit into the goal, negative = withdrawal back to the account. Not a transaction. */
export type GoalEntry = {
  id: string;
  goalId: string;
  accountId: string;
  amount: number;
  date: string; // ISO 8601
};

export type Account = {
  id: string;
  name: string;
  openingBalance: number;
};

/** Signed correction to an account balance (e.g. spending made on another phone). Not a transaction. */
export type AccountAdjustment = {
  id: string;
  accountId: string;
  amount: number; // negative reduces the balance
  date: string; // ISO 8601
};

import * as SQLite from 'expo-sqlite';
import { Transaction, TransactionCategory } from '../types/transaction';
import { UpcomingTransaction } from '../types/upcoming';
import { Account, AccountAdjustment } from '../types/account';
import { Goal, GoalEntry } from '../types/goal';

const DB_NAME = 'moneymind.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      merchant TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      receiptImageUri TEXT,
      accountName TEXT,
      source TEXT NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY NOT NULL,
      monthlyLimit REAL NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS upcoming (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      recurring INTEGER NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      openingBalance REAL NOT NULL,
      sortOrder INTEGER NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS account_adjustments (
      id TEXT PRIMARY KEY NOT NULL,
      accountId TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      sortOrder INTEGER NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      goalId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    );
  `);
  await addColumnIfMissing(db, 'transactions', 'accountId', 'TEXT');
  await addColumnIfMissing(db, 'upcoming', 'accountId', 'TEXT');
}

async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table});`);
  if (columns.some((item) => item.name === column)) return;
  await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
}

type TransactionRow = {
  id: string;
  title: string;
  merchant: string | null;
  amount: number;
  type: Transaction['type'];
  category: Transaction['category'];
  date: string;
  note: string | null;
  receiptImageUri: string | null;
  accountName: string | null;
  accountId: string | null;
  source: Transaction['source'];
};

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    title: row.title,
    merchant: row.merchant ?? undefined,
    amount: row.amount,
    type: row.type,
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    receiptImageUri: row.receiptImageUri ?? undefined,
    accountName: row.accountName ?? undefined,
    accountId: row.accountId ?? undefined,
    source: row.source,
  };
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>('SELECT * FROM transactions ORDER BY date DESC;');
  return rows.map(rowToTransaction);
}

export async function insertTransaction(transaction: Transaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO transactions (id, title, merchant, amount, type, category, date, note, receiptImageUri, accountName, accountId, source)
     VALUES ($id, $title, $merchant, $amount, $type, $category, $date, $note, $receiptImageUri, $accountName, $accountId, $source);`,
    {
      $id: transaction.id,
      $title: transaction.title,
      $merchant: transaction.merchant ?? null,
      $amount: transaction.amount,
      $type: transaction.type,
      $category: transaction.category,
      $date: transaction.date,
      $note: transaction.note ?? null,
      $receiptImageUri: transaction.receiptImageUri ?? null,
      $accountName: transaction.accountName ?? null,
      $accountId: transaction.accountId ?? null,
      $source: transaction.source,
    }
  );
}

/**
 * Posts recurring occurrences and advances the upcoming item in ONE SQL transaction.
 * INSERT OR IGNORE on the deterministic id means a retry after a crash cannot duplicate a cycle.
 */
export async function postRecurringOccurrences(
  transactions: Transaction[],
  upcomingId: string,
  nextDueDate: string
): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const transaction of transactions) {
      await db.runAsync(
        `INSERT OR IGNORE INTO transactions (id, title, merchant, amount, type, category, date, note, receiptImageUri, accountName, accountId, source)
         VALUES ($id, $title, $merchant, $amount, $type, $category, $date, $note, $receiptImageUri, $accountName, $accountId, $source);`,
        {
          $id: transaction.id,
          $title: transaction.title,
          $merchant: transaction.merchant ?? null,
          $amount: transaction.amount,
          $type: transaction.type,
          $category: transaction.category,
          $date: transaction.date,
          $note: transaction.note ?? null,
          $receiptImageUri: transaction.receiptImageUri ?? null,
          $accountName: transaction.accountName ?? null,
          $accountId: transaction.accountId ?? null,
          $source: transaction.source,
        }
      );
    }
    await db.runAsync('UPDATE upcoming SET dueDate = $dueDate WHERE id = $id;', {
      $dueDate: nextDueDate,
      $id: upcomingId,
    });
  });
}

export async function insertTransactionsIfEmpty(seed: Transaction[]): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM transactions;');
  if ((row?.count ?? 0) > 0) return;
  for (const transaction of seed) {
    await insertTransaction(transaction);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = $id;', { $id: id });
}

export async function updateTransactionCategoryInDb(
  id: string,
  category: Transaction['category']
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE transactions SET category = $category WHERE id = $id;', {
    $category: category,
    $id: id,
  });
}

export async function updateTransactionInDb(transaction: Transaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE transactions SET
       title = $title,
       merchant = $merchant,
       amount = $amount,
       type = $type,
       category = $category,
       note = $note,
       accountName = $accountName,
       accountId = $accountId
     WHERE id = $id;`,
    {
      $id: transaction.id,
      $title: transaction.title,
      $merchant: transaction.merchant ?? null,
      $amount: transaction.amount,
      $type: transaction.type,
      $category: transaction.category,
      $note: transaction.note ?? null,
      $accountName: transaction.accountName ?? null,
      $accountId: transaction.accountId ?? null,
    }
  );
}

type BudgetRow = {
  category: TransactionCategory;
  monthlyLimit: number;
};

export async function getAllBudgets(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<BudgetRow>('SELECT * FROM budgets;');
  const budgets: Record<string, number> = {};
  for (const row of rows) {
    budgets[row.category] = row.monthlyLimit;
  }
  return budgets;
}

export async function insertBudgetsIfEmpty(seed: Partial<Record<TransactionCategory, number>>): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM budgets;');
  if ((row?.count ?? 0) > 0) return;
  for (const [category, limit] of Object.entries(seed)) {
    if (limit === undefined) continue;
    await setBudgetLimit(category as TransactionCategory, limit);
  }
}

export async function setBudgetLimit(category: TransactionCategory, limit: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO budgets (category, monthlyLimit) VALUES ($category, $limit)
     ON CONFLICT(category) DO UPDATE SET monthlyLimit = $limit;`,
    { $category: category, $limit: limit }
  );
}

export async function deleteBudget(category: TransactionCategory): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM budgets WHERE category = $category;', { $category: category });
}

type UpcomingRow = {
  id: string;
  title: string;
  amount: number;
  type: UpcomingTransaction['type'];
  category: UpcomingTransaction['category'];
  dueDate: string;
  recurring: number;
  accountId: string | null;
};

function rowToUpcoming(row: UpcomingRow): UpcomingTransaction {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    type: row.type,
    category: row.category,
    dueDate: row.dueDate,
    recurring: row.recurring === 1,
    accountId: row.accountId ?? undefined,
  };
}

export async function getAllUpcoming(): Promise<UpcomingTransaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<UpcomingRow>('SELECT * FROM upcoming ORDER BY dueDate ASC;');
  return rows.map(rowToUpcoming);
}

export async function insertUpcoming(item: UpcomingTransaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO upcoming (id, title, amount, type, category, dueDate, recurring, accountId)
     VALUES ($id, $title, $amount, $type, $category, $dueDate, $recurring, $accountId);`,
    {
      $id: item.id,
      $title: item.title,
      $amount: item.amount,
      $type: item.type,
      $category: item.category,
      $dueDate: item.dueDate,
      $recurring: item.recurring ? 1 : 0,
      $accountId: item.accountId ?? null,
    }
  );
}

export async function insertUpcomingIfEmpty(seed: UpcomingTransaction[]): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM upcoming;');
  if ((row?.count ?? 0) > 0) return;
  for (const item of seed) {
    await insertUpcoming(item);
  }
}

export async function updateUpcomingInDb(item: UpcomingTransaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE upcoming SET
       title = $title,
       amount = $amount,
       type = $type,
       category = $category,
       dueDate = $dueDate,
       recurring = $recurring,
       accountId = $accountId
     WHERE id = $id;`,
    {
      $id: item.id,
      $title: item.title,
      $amount: item.amount,
      $type: item.type,
      $category: item.category,
      $dueDate: item.dueDate,
      $recurring: item.recurring ? 1 : 0,
      $accountId: item.accountId ?? null,
    }
  );
}

export async function deleteUpcoming(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM upcoming WHERE id = $id;', { $id: id });
}

type AccountRow = {
  id: string;
  name: string;
  openingBalance: number;
};

export async function getAllAccounts(): Promise<Account[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AccountRow>('SELECT id, name, openingBalance FROM accounts ORDER BY sortOrder ASC;');
  return rows;
}

export async function insertAccountsIfEmpty(seed: Account[]): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM accounts;');
  if ((row?.count ?? 0) > 0) return;
  for (const [index, account] of seed.entries()) {
    await insertAccount(account, index);
  }
}

export async function insertAccount(account: Account, sortOrder: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO accounts (id, name, openingBalance, sortOrder) VALUES ($id, $name, $openingBalance, $sortOrder);`,
    { $id: account.id, $name: account.name, $openingBalance: account.openingBalance, $sortOrder: sortOrder }
  );
}

export async function updateAccountInDb(account: Account): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE accounts SET name = $name, openingBalance = $openingBalance WHERE id = $id;', {
    $id: account.id,
    $name: account.name,
    $openingBalance: account.openingBalance,
  });
}

/** Removes the account and its adjustments in one SQL transaction. Its transactions fall back to the default account. */
export async function deleteAccountInDb(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM account_adjustments WHERE accountId = $id;', { $id: id });
    await db.runAsync('DELETE FROM accounts WHERE id = $id;', { $id: id });
  });
}

export async function getAllAdjustments(): Promise<AccountAdjustment[]> {
  const db = await getDb();
  return db.getAllAsync<AccountAdjustment>('SELECT * FROM account_adjustments ORDER BY date DESC;');
}

export async function insertAdjustment(adjustment: AccountAdjustment): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO account_adjustments (id, accountId, amount, date) VALUES ($id, $accountId, $amount, $date);`,
    { $id: adjustment.id, $accountId: adjustment.accountId, $amount: adjustment.amount, $date: adjustment.date }
  );
}

export async function deleteAdjustment(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM account_adjustments WHERE id = $id;', { $id: id });
}

export async function getAllGoals(): Promise<Goal[]> {
  const db = await getDb();
  return db.getAllAsync<Goal>('SELECT id, name, targetAmount FROM goals ORDER BY sortOrder ASC;');
}

export async function insertGoal(goal: Goal, sortOrder: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO goals (id, name, targetAmount, sortOrder) VALUES ($id, $name, $targetAmount, $sortOrder);`,
    { $id: goal.id, $name: goal.name, $targetAmount: goal.targetAmount, $sortOrder: sortOrder }
  );
}

export async function updateGoalInDb(goal: Goal): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE goals SET name = $name, targetAmount = $targetAmount WHERE id = $id;', {
    $id: goal.id,
    $name: goal.name,
    $targetAmount: goal.targetAmount,
  });
}

/** Removes the goal and its entries in one SQL transaction; the money returns to the accounts it came from. */
export async function deleteGoalInDb(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM goal_entries WHERE goalId = $id;', { $id: id });
    await db.runAsync('DELETE FROM goals WHERE id = $id;', { $id: id });
  });
}

export async function getAllGoalEntries(): Promise<GoalEntry[]> {
  const db = await getDb();
  return db.getAllAsync<GoalEntry>('SELECT * FROM goal_entries ORDER BY date DESC;');
}

export async function insertGoalEntry(entry: GoalEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO goal_entries (id, goalId, accountId, amount, date) VALUES ($id, $goalId, $accountId, $amount, $date);`,
    { $id: entry.id, $goalId: entry.goalId, $accountId: entry.accountId, $amount: entry.amount, $date: entry.date }
  );
}

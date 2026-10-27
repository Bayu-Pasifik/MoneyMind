import * as SQLite from 'expo-sqlite';
import { Transaction, TransactionCategory } from '../types/transaction';
import { UpcomingTransaction } from '../types/upcoming';

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
    `INSERT INTO transactions (id, title, merchant, amount, type, category, date, note, receiptImageUri, accountName, source)
     VALUES ($id, $title, $merchant, $amount, $type, $category, $date, $note, $receiptImageUri, $accountName, $source);`,
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
        `INSERT OR IGNORE INTO transactions (id, title, merchant, amount, type, category, date, note, receiptImageUri, accountName, source)
         VALUES ($id, $title, $merchant, $amount, $type, $category, $date, $note, $receiptImageUri, $accountName, $source);`,
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
       accountName = $accountName
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
    `INSERT INTO upcoming (id, title, amount, type, category, dueDate, recurring)
     VALUES ($id, $title, $amount, $type, $category, $dueDate, $recurring);`,
    {
      $id: item.id,
      $title: item.title,
      $amount: item.amount,
      $type: item.type,
      $category: item.category,
      $dueDate: item.dueDate,
      $recurring: item.recurring ? 1 : 0,
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
       recurring = $recurring
     WHERE id = $id;`,
    {
      $id: item.id,
      $title: item.title,
      $amount: item.amount,
      $type: item.type,
      $category: item.category,
      $dueDate: item.dueDate,
      $recurring: item.recurring ? 1 : 0,
    }
  );
}

export async function deleteUpcoming(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM upcoming WHERE id = $id;', { $id: id });
}

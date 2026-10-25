import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types/transaction';

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

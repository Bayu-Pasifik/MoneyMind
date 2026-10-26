import { Transaction, TransactionCategory } from '../types/transaction';
import { getCategoryBreakdown } from './analytics';
import { getCategoryLabel } from './categories';
import { formatCurrency } from './format';
import { TFunction } from '../i18n/LocaleContext';

const VALID_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'salary',
  'transfer',
  'other',
];

const ADD_COMMAND = /^\/add\s+(expense|income)\s+(\d+)(?:\s+(\S+))?(?:\s+(.*))?$/i;

export type ChatCommandResult = {
  reply: string;
  transaction?: Transaction;
};

/**
 * Parses "/add expense|income <amount> [category] [note]" into a Transaction.
 * Returns null when the text isn't an /add command, so callers can fall back
 * to the regular rule-based reply.
 */
export function parseAddCommand(text: string, t: TFunction): ChatCommandResult | null {
  const match = text.trim().match(ADD_COMMAND);
  if (!match) return null;

  const [, typeRaw, amountRaw, categoryRaw, noteRaw] = match;
  const type = typeRaw.toLowerCase() as 'expense' | 'income';
  const amount = Number(amountRaw);

  if (!amount || amount <= 0) {
    return { reply: t('bot.addInvalidAmount') };
  }

  const category: TransactionCategory = VALID_CATEGORIES.includes(categoryRaw as TransactionCategory)
    ? (categoryRaw as TransactionCategory)
    : 'other';
  const note = categoryRaw && !VALID_CATEGORIES.includes(categoryRaw as TransactionCategory)
    ? [categoryRaw, noteRaw].filter(Boolean).join(' ')
    : noteRaw;

  const transaction: Transaction = {
    id: `chat-${Date.now()}`,
    title: note?.trim() || (type === 'expense' ? 'Chat expense' : 'Chat income'),
    amount,
    type,
    category,
    date: new Date().toISOString(),
    note: note?.trim() || undefined,
    source: 'manual',
  };

  return {
    reply: t('bot.addConfirm', {
      type: t(type === 'expense' ? 'bot.expenseType' : 'bot.incomeType'),
      amount: formatCurrency(amount),
      category: getCategoryLabel(t, category),
    }),
    transaction,
  };
}

const KEYWORDS = {
  balance: /balance|saldo/,
  income: /income|earn|pemasukan|penghasilan|gaji/,
  spend: /spend|expense|spent|pengeluaran|belanja|keluar/,
  budget: /budget|anggaran/,
  greeting: /hi|hello|hey|halo|hai/,
};

/**
 * Rule-based assistant over local transaction data. No LLM/API is wired up;
 * swap this for a real backend call when one is available (see F6 notes).
 */
export function generateAssistantReply(question: string, transactions: Transaction[], t: TFunction): string {
  const normalized = question.toLowerCase();

  const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  if (/^\/add/.test(normalized)) {
    return t('bot.addHint');
  }

  if (/^\/report/.test(normalized)) {
    const breakdown = getCategoryBreakdown(transactions);
    const top = breakdown[0];
    return top
      ? t('bot.reportWithTop', {
          income: formatCurrency(totalIncome),
          expense: formatCurrency(totalExpense),
          category: getCategoryLabel(t, top.category),
        })
      : t('bot.reportNoTop', { income: formatCurrency(totalIncome), expense: formatCurrency(totalExpense) });
  }

  if (/^\/summary/.test(normalized)) {
    return t('bot.summary', {
      balance: formatCurrency(totalIncome - totalExpense),
      income: formatCurrency(totalIncome),
      expense: formatCurrency(totalExpense),
    });
  }

  if (KEYWORDS.balance.test(normalized)) {
    return t('bot.balance', { balance: formatCurrency(totalIncome - totalExpense) });
  }

  if (KEYWORDS.income.test(normalized)) {
    return t('bot.income', { income: formatCurrency(totalIncome) });
  }

  if (KEYWORDS.spend.test(normalized)) {
    const breakdown = getCategoryBreakdown(transactions);
    const top = breakdown[0];
    if (!top) {
      return t('bot.spendNoExpenses');
    }
    return t('bot.spend', {
      total: formatCurrency(totalExpense),
      category: getCategoryLabel(t, top.category),
      amount: formatCurrency(top.total),
      percent: Math.round(top.ratio * 100),
    });
  }

  if (KEYWORDS.budget.test(normalized)) {
    return t('bot.budget');
  }

  if (KEYWORDS.greeting.test(normalized)) {
    return t('bot.hello');
  }

  return t('bot.fallback');
}

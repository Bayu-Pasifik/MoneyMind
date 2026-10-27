import { Transaction } from '../types/transaction';
import { guessCategory } from './ocr';

export type CapturedNotification = {
  app: string;
  title?: string;
  text?: string;
  bigText?: string;
  time?: string;
};

// Matches an amount written with thousands separators (e.g. "45.000" or
// "1,234,567"), same convention as the OCR receipt parser — a bare run of
// digits (order IDs, phone numbers) never has these.
const CURRENCY_TOKEN = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2})?/i;

const EXPENSE_HINTS = /debit|pembayaran|pembelian|bayar|beli|tarik\s*tunai|terpotong/i;
const INCOME_HINTS = /kredit|terima|masuk|transfer\s*masuk|top\s*up\s*berhasil|refund/i;

// Package names of common Indonesian bank/e-wallet apps whose notifications
// are worth parsing. Anything outside this list is ignored even if it
// happens to contain a currency-shaped number, to avoid false positives
// from games, shopping apps, etc.
const FINANCE_APP_HINTS = /bank|bca|bri|bni|mandiri|cimb|permata|danamon|btn|id\.dana|gojek|gopay|ovo|shopee|linkaja|jenius|jago|flip|livin|wallet|neo/i;

function extractAmount(text: string): number | null {
  const match = text.match(CURRENCY_TOKEN);
  if (!match) return null;
  const normalized = Number(match[1].replace(/[.,]/g, ''));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function extractMerchant(text: string): string | undefined {
  const match = text.match(/\b(?:di|at|ke|to)\s+([A-Z0-9][\w .,'&-]{2,40})/i);
  return match?.[1]?.trim();
}

/**
 * Turns a captured bank/e-wallet notification into a Transaction, or null
 * when it isn't recognizable as a money movement (most notifications
 * aren't). Caller is responsible for persisting the result.
 */
export function parseNotificationToTransaction(notification: CapturedNotification): Transaction | null {
  if (!FINANCE_APP_HINTS.test(notification.app)) return null;

  const text = [notification.title, notification.text, notification.bigText].filter(Boolean).join(' ');
  if (!text.trim()) return null;

  const amount = extractAmount(text);
  if (!amount) return null;

  const type = INCOME_HINTS.test(text) && !EXPENSE_HINTS.test(text) ? 'income' : 'expense';
  const merchant = extractMerchant(text);
  const postedAt = notification.time ? Number(notification.time) : Date.now();

  return {
    id: `notif-${Number.isFinite(postedAt) ? postedAt : Date.now()}`,
    title: merchant ?? (notification.title || 'Notification transaction'),
    merchant,
    amount,
    type,
    category: guessCategory(text),
    date: new Date(Number.isFinite(postedAt) ? postedAt : Date.now()).toISOString(),
    note: notification.text,
    source: 'notification',
  };
}

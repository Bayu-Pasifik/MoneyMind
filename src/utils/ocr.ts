import * as FileSystem from 'expo-file-system/legacy';
import { TransactionCategory } from '../types/transaction';

const OCR_SPACE_ENDPOINT = 'https://api.ocr.space/parse/image';
const API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;

export type OcrReceiptResult = {
  merchant: string;
  amount: number;
  category: TransactionCategory;
  itemCount: number;
  rawText: string;
};

export class OcrError extends Error {}

/**
 * Sends a receipt photo to the OCR.space free API (https://ocr.space/ocrapi)
 * and extracts merchant/amount/category/item-count heuristically from the
 * recognized text. OCR.space's free tier (25k requests/month, no card
 * required) is enough for a personal project; results are rougher than a
 * paid engine so the review screen keeps every field editable.
 */
export async function extractReceiptFromImage(uri: string): Promise<OcrReceiptResult> {
  if (!API_KEY) {
    throw new OcrError('Missing EXPO_PUBLIC_OCR_SPACE_API_KEY — add it to .env and restart the dev server.');
  }

  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

  const form = new FormData();
  form.append('apikey', API_KEY);
  form.append('base64Image', `data:image/jpeg;base64,${base64}`);
  form.append('language', 'eng');
  form.append('OCREngine', '2');
  form.append('scale', 'true');
  form.append('isTable', 'true');

  const response = await fetch(OCR_SPACE_ENDPOINT, { method: 'POST', body: form });
  if (!response.ok) {
    throw new OcrError(`OCR request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.IsErroredOnProcessing) {
    const message = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(', ') : data.ErrorMessage;
    throw new OcrError(message || 'OCR.space could not process this image.');
  }

  const text: string = data.ParsedResults?.[0]?.ParsedText ?? '';
  if (!text.trim()) {
    throw new OcrError('No text was recognized in this photo. Try a clearer shot.');
  }

  return parseReceiptText(text);
}

const FOOD_HINTS = /warung|restoran|resto|cafe|kedai|kopi|coffee|makan|food/i;
const SHOPPING_HINTS = /mart|toko|store|shop|supermarket|mall/i;
const BILLS_HINTS = /pln|listrik|pdam|telkom|indihome|wifi|internet/i;

export function guessCategory(text: string): TransactionCategory {
  if (FOOD_HINTS.test(text)) return 'food';
  if (BILLS_HINTS.test(text)) return 'bills';
  if (SHOPPING_HINTS.test(text)) return 'shopping';
  return 'other';
}

function guessMerchant(lines: string[]): string {
  const candidate = lines.find((line) => {
    const trimmed = line.trim();
    if (trimmed.length < 3) return false;
    if (/^\d+[\d.,\s]*$/.test(trimmed)) return false; // pure numbers
    return true;
  });
  return candidate?.trim() ?? 'Unknown merchant';
}

const TOTAL_LINE = /(total|jumlah|bayar|subtotal|grand\s*total)/i;
const CASH_LINE = /(tunai|cash)/i;
const CHANGE_LINE = /(kembali|change|kembalian)/i;

// Only matches numbers written with thousands separators (e.g. 22.500 or
// 1,234,567) — a bare run of digits (phone numbers, receipt/order IDs,
// dates) never has these, so it's excluded rather than mistaken for money.
const CURRENCY_TOKEN = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+)/gi;

function lastCurrencyAmount(line: string): number | null {
  const matches = [...line.matchAll(CURRENCY_TOKEN)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1][1];
  const normalized = Number(last.replace(/[.,]/g, ''));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function guessAmount(lines: string[]): number {
  // Most reliable signal on an Indonesian POS receipt: cash paid minus
  // change given equals the actual total. Require the line to also carry a
  // currency amount, since "CASH" alone also appears as a payment-method
  // label (e.g. "Pel. : UMUM/CASH") with no number on it.
  const cashLine = lines.find((line) => CASH_LINE.test(line) && lastCurrencyAmount(line) !== null);
  const changeLine = lines.find((line) => CHANGE_LINE.test(line) && lastCurrencyAmount(line) !== null);
  const cash = cashLine ? lastCurrencyAmount(cashLine) : null;
  const change = changeLine ? lastCurrencyAmount(changeLine) : null;
  if (cash !== null && change !== null && cash > change) {
    return cash - change;
  }

  const totalLine = [...lines].reverse().find((line) => TOTAL_LINE.test(line));
  if (totalLine) {
    const amount = lastCurrencyAmount(totalLine);
    if (amount) return amount;
  }

  if (cash !== null) return cash;

  const allAmounts = lines
    .map(lastCurrencyAmount)
    .filter((value): value is number => value !== null);

  return allAmounts.length > 0 ? Math.max(...allAmounts) : 0;
}

const QUANTITY_HINT = /\bx\s*\d/i;

function guessItemCount(lines: string[]): number {
  const itemLines = lines.filter((line) => QUANTITY_HINT.test(line));
  return Math.max(1, itemLines.length);
}

export function parseReceiptText(text: string): OcrReceiptResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    merchant: guessMerchant(lines),
    amount: guessAmount(lines),
    category: guessCategory(text),
    itemCount: guessItemCount(lines),
    rawText: text,
  };
}

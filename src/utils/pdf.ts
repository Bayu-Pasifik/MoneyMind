import { Transaction } from '../types/transaction';
import { getCategoryLabel } from './categories';
import { formatCurrency, formatDate } from './format';
import { Locale, TFunction } from '../i18n/LocaleContext';

export function transactionsToReportHtml(
  transactions: Transaction[],
  rangeLabel: string,
  t: TFunction,
  locale: Locale
): string {
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  const rows = transactions
    .map(
      (item) => `
        <tr>
          <td>${formatDate(item.date, locale)}</td>
          <td>${item.title}</td>
          <td>${getCategoryLabel(t, item.category)}</td>
          <td style="text-align:right;color:${item.type === 'income' ? '#00795E' : '#D92D38'}">
            ${item.type === 'income' ? '+' : '-'}${formatCurrency(item.amount)}
          </td>
        </tr>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #0D1B3E; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .sub { color: #667082; font-size: 12px; margin-bottom: 20px; }
          .stats { display: flex; gap: 16px; margin-bottom: 24px; }
          .stat { flex: 1; border: 1px solid #E4ECF9; border-radius: 12px; padding: 12px; }
          .stat .label { color: #667082; font-size: 11px; }
          .stat .value { font-size: 16px; font-weight: 700; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; color: #667082; border-bottom: 1px solid #E4ECF9; padding: 8px 4px; }
          td { padding: 8px 4px; border-bottom: 1px solid #F0F2F5; }
        </style>
      </head>
      <body>
        <h1>MoneyMind report</h1>
        <div class="sub">${rangeLabel} &middot; ${transactions.length} transactions</div>
        <div class="stats">
          <div class="stat"><div class="label">Income</div><div class="value">${formatCurrency(income)}</div></div>
          <div class="stat"><div class="label">Expenses</div><div class="value">${formatCurrency(expense)}</div></div>
          <div class="stat"><div class="label">Saved</div><div class="value">${formatCurrency(income - expense)}</div></div>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th>Title</th><th>Category</th><th style="text-align:right">Amount</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}

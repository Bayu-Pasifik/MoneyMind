import { describe, expect, it, vi } from 'vitest';

// ocr.ts pulls in expo-file-system, which can't load under node.
vi.mock('expo-file-system/legacy', () => ({}));

import { parseNotificationToTransaction } from '../notificationParser';

const TIME = '1760000000000';

describe('parseNotificationToTransaction', () => {
  it('ignores apps that are not finance apps', () => {
    expect(
      parseNotificationToTransaction({ app: 'com.game.candy', text: 'Bayar Rp 45.000' })
    ).toBeNull();
  });

  it('returns null for empty notifications', () => {
    expect(parseNotificationToTransaction({ app: 'com.bca.mobile' })).toBeNull();
    expect(parseNotificationToTransaction({ app: 'com.bca.mobile', title: '  ' })).toBeNull();
  });

  it('returns null when no amount with thousands separators is present', () => {
    expect(
      parseNotificationToTransaction({ app: 'com.bca.mobile', text: 'Order 123456789 selesai' })
    ).toBeNull();
  });

  it('parses an expense with Rp prefix and dot separators', () => {
    const result = parseNotificationToTransaction({
      app: 'com.bca.mobile',
      title: 'Pembayaran berhasil',
      text: 'Pembayaran Rp 45.000 di Warung Makan Bu Ani',
      time: TIME,
    });
    expect(result).toMatchObject({
      amount: 45000,
      type: 'expense',
      category: 'food',
      source: 'notification',
      id: `notif-${TIME}`,
    });
    expect(result?.merchant).toContain('Warung Makan Bu Ani');
    expect(result?.date).toBe(new Date(Number(TIME)).toISOString());
  });

  it('parses comma-separated amounts and strips decimal cents', () => {
    const result = parseNotificationToTransaction({
      app: 'id.dana',
      text: 'Debit Rp1,234,567.00 untuk pembelian',
      time: TIME,
    });
    expect(result?.amount).toBe(1234567);
    expect(result?.type).toBe('expense');
  });

  it('classifies income when only income hints match', () => {
    const result = parseNotificationToTransaction({
      app: 'com.bri.brimo',
      text: 'Transfer masuk Rp 2.500.000 dari Budi',
      time: TIME,
    });
    expect(result?.type).toBe('income');
    expect(result?.amount).toBe(2500000);
  });

  it('prefers expense when both income and expense hints match', () => {
    const result = parseNotificationToTransaction({
      app: 'com.bri.brimo',
      text: 'Pembayaran Rp 50.000 berhasil, refund tidak berlaku',
      time: TIME,
    });
    expect(result?.type).toBe('expense');
  });

  it('combines title, text and bigText when extracting', () => {
    const result = parseNotificationToTransaction({
      app: 'com.gojek.app',
      title: 'GoPay',
      text: 'Pembayaran berhasil',
      bigText: 'Total Rp 30.000',
      time: TIME,
    });
    expect(result?.amount).toBe(30000);
  });

  it('falls back to title when no merchant, and to default title otherwise', () => {
    const withTitle = parseNotificationToTransaction({
      app: 'com.bca.mobile',
      title: 'Debit BCA',
      text: 'Rp 10.000 terpotong',
      time: TIME,
    });
    expect(withTitle?.title).toBe('Debit BCA');
    expect(withTitle?.merchant).toBeUndefined();

    const noTitle = parseNotificationToTransaction({
      app: 'com.bca.mobile',
      text: 'Rp 10.000 terpotong',
      time: TIME,
    });
    expect(noTitle?.title).toBe('Notification transaction');
  });

  it('uses current time when time is missing or invalid', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T00:00:00.000Z'));
    try {
      const missing = parseNotificationToTransaction({ app: 'com.bca.mobile', text: 'Rp 10.000 debit' });
      expect(missing?.date).toBe('2026-10-27T00:00:00.000Z');

      const invalid = parseNotificationToTransaction({
        app: 'com.bca.mobile',
        text: 'Rp 10.000 debit',
        time: 'abc',
      });
      expect(invalid?.date).toBe('2026-10-27T00:00:00.000Z');
      expect(invalid?.id).toMatch(/^notif-\d+$/);
    } finally {
      vi.useRealTimers();
    }
  });
});

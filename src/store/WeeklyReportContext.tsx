import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionsContext';
import { generateWeeklyReport, WeeklyReport } from '../utils/insight';
import { sendWeeklyReportNotification } from '../utils/weeklyReportNotifications';
import { useLocale } from '../i18n/LocaleContext';

const ENABLED_KEY = 'moneymind:weekly-report-enabled';
const LAST_AT_KEY = 'moneymind:weekly-report-last-at';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type WeeklyReportContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  latestReport: WeeklyReport | null;
  generateNow: () => void;
};

const WeeklyReportContext = createContext<WeeklyReportContextValue | undefined>(undefined);

/**
 * Generates a rule-based weekly spending summary from local transaction data
 * (see utils/insight.ts) and, once a week while enabled, surfaces it as a
 * local notification + a Home-screen card. No Telegram/LLM backend involved.
 *
 * Only `lastGeneratedAt` is persisted — the report text itself is always
 * derived live from current transactions + the active language, so it never
 * goes stale (e.g. after switching the app language in Settings).
 */
export function WeeklyReportProvider({ children }: { children: React.ReactNode }) {
  const { transactions, isReady } = useTransactions();
  const { t } = useLocale();
  const [enabled, setEnabledState] = useState(true);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<number | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [enabledValue, lastAtValue] = await Promise.all([
        AsyncStorage.getItem(ENABLED_KEY),
        AsyncStorage.getItem(LAST_AT_KEY),
      ]);
      if (enabledValue === 'false') setEnabledState(false);
      if (lastAtValue) setLastGeneratedAt(Number(lastAtValue));
      setStorageLoaded(true);
    })();
  }, []);

  const latestReport = useMemo(() => {
    if (lastGeneratedAt === null) return null;
    return generateWeeklyReport(transactions, t);
  }, [lastGeneratedAt, transactions, t]);

  const runReport = (transactionsSnapshot: typeof transactions) => {
    const report = generateWeeklyReport(transactionsSnapshot, t);
    const now = Date.now();
    setLastGeneratedAt(now);
    AsyncStorage.setItem(LAST_AT_KEY, String(now)).catch(() => {});
    sendWeeklyReportNotification(report).catch((error) =>
      console.error('[notifications] failed to send weekly report', error)
    );
  };

  useEffect(() => {
    if (!storageLoaded || !isReady || !enabled) return;
    const due = lastGeneratedAt === null || Date.now() - lastGeneratedAt >= SEVEN_DAYS_MS;
    if (due) runReport(transactions);
    // Only re-check when the gating conditions change, not on every transaction edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageLoaded, isReady, enabled, lastGeneratedAt]);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    AsyncStorage.setItem(ENABLED_KEY, String(value)).catch(() => {});
  };

  const generateNow = () => runReport(transactions);

  return (
    <WeeklyReportContext.Provider value={{ enabled, setEnabled, latestReport, generateNow }}>
      {children}
    </WeeklyReportContext.Provider>
  );
}

export function useWeeklyReport() {
  const ctx = useContext(WeeklyReportContext);
  if (!ctx) {
    throw new Error('useWeeklyReport must be used within a WeeklyReportProvider');
  }
  return ctx;
}

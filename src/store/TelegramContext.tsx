import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONNECTED_KEY = 'moneymind:telegram-connected';

const DEMO_USERNAME = '@alexjohnson';
const BOT_USERNAME = '@MoneyMindBot';

type TelegramContextValue = {
  connected: boolean;
  username: string;
  botUsername: string;
  connect: () => void;
  disconnect: () => void;
};

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined);

/**
 * Tracks a mocked Telegram-bot connection. There is no real Telegram bot
 * backend here; connect() just flips a persisted flag so the UI (connect
 * banner, chat messages tagged as Telegram-origin, slash commands) can be
 * built and demonstrated end-to-end. Wiring a real bot needs a server-side
 * webhook and a bot token, which is a separate effort. The weekly report
 * (see store/WeeklyReportContext.tsx) is independent of this — it's a real,
 * local feature and no longer gated behind a Telegram connection.
 */
export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CONNECTED_KEY).then((value) => {
      if (value === 'false') setConnected(false);
    });
  }, []);

  const connect = () => {
    setConnected(true);
    AsyncStorage.setItem(CONNECTED_KEY, 'true').catch(() => {});
  };

  const disconnect = () => {
    setConnected(false);
    AsyncStorage.setItem(CONNECTED_KEY, 'false').catch(() => {});
  };

  return (
    <TelegramContext.Provider
      value={{
        connected,
        username: DEMO_USERNAME,
        botUsername: BOT_USERNAME,
        connect,
        disconnect,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return ctx;
}

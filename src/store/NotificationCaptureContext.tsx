import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'moneymind:notification-capture-enabled';

type NotificationCaptureContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const NotificationCaptureContext = createContext<NotificationCaptureContextValue | undefined>(
  undefined
);

/**
 * Tracks the user's Notification Capture preference. There is no real
 * notification-listener here: reading other apps' notifications requires a
 * native Android NotificationListenerService (and no iOS equivalent exists),
 * which is outside Expo Go / the managed workflow. The toggle and the seed
 * data's 'notification'-sourced transactions demonstrate the feature's UI;
 * wiring an actual listener would need a config plugin and a dev client.
 */
export function NotificationCaptureProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'false') setEnabledState(false);
    });
  }, []);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value)).catch(() => {});
  };

  return (
    <NotificationCaptureContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </NotificationCaptureContext.Provider>
  );
}

export function useNotificationCapture() {
  const ctx = useContext(NotificationCaptureContext);
  if (!ctx) {
    throw new Error('useNotificationCapture must be used within a NotificationCaptureProvider');
  }
  return ctx;
}

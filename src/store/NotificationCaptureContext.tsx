import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNAndroidNotificationListener, {
  RNAndroidNotificationListenerPermissionStatus,
} from 'react-native-android-notification-listener';

const STORAGE_KEY = 'moneymind:notification-capture-enabled';

type NotificationCaptureContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  permissionStatus: RNAndroidNotificationListenerPermissionStatus | 'unsupported';
  requestPermission: () => void;
};

const NotificationCaptureContext = createContext<NotificationCaptureContextValue | undefined>(
  undefined
);

const isAndroid = Platform.OS === 'android';

/**
 * Reads notification text from other apps (bank/e-wallet debit & credit
 * alerts) via a native Android NotificationListenerService
 * (react-native-android-notification-listener) and turns recognizable ones
 * into transactions — see index.ts's headless task and
 * utils/notificationParser.ts. Android only: iOS has no API for reading
 * other apps' notifications. Requires a custom dev client build (not Expo
 * Go) since it ships native code.
 */
export function NotificationCaptureProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<
    RNAndroidNotificationListenerPermissionStatus | 'unsupported'
  >('unknown');

  const refreshPermissionStatus = () => {
    if (!isAndroid || !RNAndroidNotificationListener) {
      setPermissionStatus('unsupported');
      return;
    }
    RNAndroidNotificationListener.getPermissionStatus()
      .then(setPermissionStatus)
      .catch(() => setPermissionStatus('unknown'));
  };

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'false') setEnabledState(false);
    });
    refreshPermissionStatus();

    // The permission is granted in a system settings screen outside the
    // app, so re-check when the user comes back to it.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermissionStatus();
    });
    return () => subscription.remove();
  }, []);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value)).catch(() => {});
    if (value && permissionStatus !== 'authorized') {
      requestPermission();
    }
  };

  const requestPermission = () => {
    if (!isAndroid || !RNAndroidNotificationListener) return;
    RNAndroidNotificationListener.requestPermission();
  };

  return (
    <NotificationCaptureContext.Provider
      value={{ enabled, setEnabled, permissionStatus, requestPermission }}
    >
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

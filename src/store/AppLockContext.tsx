import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'moneymind.lock.pin';
const BIOMETRIC_KEY = 'moneymind.lock.biometric';

/** Re-lock only after the app has been in the background this long, so camera/permission/picker hops don't re-prompt. */
const RELOCK_AFTER_MS = 30_000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

export const PIN_LENGTH = 4;

type AppLockContextValue = {
  isReady: boolean;
  enabled: boolean;
  locked: boolean;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  /** Seconds left in the wrong-PIN lockout, 0 when not locked out. */
  lockoutSeconds: number;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  unlock: () => void;
  disable: () => Promise<void>;
  setBiometricEnabled: (value: boolean) => Promise<void>;
  /** Biometric prompt (falls back to the device passcode); unlocks on success. */
  unlockWithDevice: () => Promise<boolean>;
};

const AppLockContext = createContext<AppLockContextValue | undefined>(undefined);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [biometricEnabled, setBiometricState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const failures = useRef(0);
  const backgroundedAt = useRef<number | null>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [pin, bio, hasHardware, enrolled] = await Promise.all([
          SecureStore.getItemAsync(PIN_KEY),
          SecureStore.getItemAsync(BIOMETRIC_KEY),
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        const hasPin = !!pin;
        enabledRef.current = hasPin;
        setEnabled(hasPin);
        setLocked(hasPin);
        setBiometricState(bio === 'true');
        setBiometricAvailable(hasHardware && enrolled);
      } catch {
        // Unreadable store: stay unlocked rather than brick the app.
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active') {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (enabledRef.current && since !== null && Date.now() - since >= RELOCK_AFTER_MS) {
          setLocked(true);
        }
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (lockoutUntil <= Date.now()) return;
    setNow(Date.now());
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockoutUntil) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  const lockoutSeconds = lockoutUntil > now ? Math.ceil((lockoutUntil - now) / 1000) : 0;

  const setPin = useCallback(async (pin: string) => {
    await SecureStore.setItemAsync(PIN_KEY, pin, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    enabledRef.current = true;
    failures.current = 0;
    setEnabled(true);
  }, []);

  const verifyPin = useCallback(
    async (pin: string) => {
      if (Date.now() < lockoutUntil) return false;
      const stored = await SecureStore.getItemAsync(PIN_KEY);
      if (stored !== null && stored === pin) {
        failures.current = 0;
        return true;
      }
      failures.current += 1;
      if (failures.current >= MAX_ATTEMPTS) {
        failures.current = 0;
        setLockoutUntil(Date.now() + LOCKOUT_MS);
      }
      return false;
    },
    [lockoutUntil],
  );

  const unlock = useCallback(() => setLocked(false), []);

  const disable = useCallback(async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
    enabledRef.current = false;
    setEnabled(false);
    setLocked(false);
    setBiometricState(false);
  }, []);

  const setBiometricEnabled = useCallback(async (value: boolean) => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, value ? 'true' : 'false');
    setBiometricState(value);
  }, []);

  const unlockWithDevice = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'MoneyMind' });
      if (result.success) {
        failures.current = 0;
        setLocked(false);
        return true;
      }
    } catch {
      // fall through
    }
    return false;
  }, []);

  const value = useMemo<AppLockContextValue>(
    () => ({
      isReady,
      enabled,
      locked: enabled && locked,
      biometricEnabled,
      biometricAvailable,
      lockoutSeconds,
      setPin,
      verifyPin,
      unlock,
      disable,
      setBiometricEnabled,
      unlockWithDevice,
    }),
    [isReady, enabled, locked, biometricEnabled, biometricAvailable, lockoutSeconds, setPin, verifyPin, unlock, disable, setBiometricEnabled, unlockWithDevice],
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock() {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within an AppLockProvider');
  return ctx;
}

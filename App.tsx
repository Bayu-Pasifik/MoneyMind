import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { LocaleProvider } from './src/i18n/LocaleContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LockScreen } from './src/screens/LockScreen';
import { AppLockProvider, useAppLock } from './src/store/AppLockContext';

const ONBOARDING_STORAGE_KEY = 'moneymind:onboarding-complete';

function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

function AppContent() {
  const { colors } = useTheme();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).then((value) => {
      setHasSeenOnboarding(value === 'true');
    });
  }, []);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
    AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true').catch(() => {});
  };

  if (hasSeenOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onDone={completeOnboarding} />;
  }

  return (
    <AppLockGate>
      <RootNavigator />
    </AppLockGate>
  );
}

/**
 * Keeps the app mounted (preserving navigation state) and covers it with the
 * lock screen while locked. Children are hidden from screen readers meanwhile.
 */
function AppLockGate({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { isReady, locked } = useAppLock();

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 1 }}
        importantForAccessibility={locked ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={locked}
      >
        {children}
      </View>
      {locked ? (
        <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
          <LockScreen />
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LocaleProvider>
          <SafeAreaProvider>
            <ThemedStatusBar />
            <AppLockProvider>
              <AppContent />
            </AppLockProvider>
          </SafeAreaProvider>
        </LocaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

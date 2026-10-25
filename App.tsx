import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

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

  return <RootNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <ThemedStatusBar />
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

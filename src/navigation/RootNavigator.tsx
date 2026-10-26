import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { TransactionsProvider, useTransactions } from '../store/TransactionsContext';
import { NotificationCaptureProvider } from '../store/NotificationCaptureContext';
import { TelegramProvider } from '../store/TelegramContext';
import { BudgetsProvider } from '../store/BudgetsContext';
import { UpcomingProvider } from '../store/UpcomingContext';
import { WeeklyReportProvider } from '../store/WeeklyReportContext';
import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { ScanReceiptScreen } from '../screens/ScanReceiptScreen';
import { ExportSheetScreen } from '../screens/ExportSheetScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { CategoryPickerScreen } from '../screens/CategoryPickerScreen';
import { BudgetSettingsScreen } from '../screens/BudgetSettingsScreen';
import { UpcomingFormScreen } from '../screens/UpcomingFormScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function DatabaseGate({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { isReady } = useTransactions();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export function RootNavigator() {
  const { colors, mode } = useTheme();

  const navigationTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <TransactionsProvider>
      <DatabaseGate>
      <BudgetsProvider>
      <UpcomingProvider>
      <WeeklyReportProvider>
      <NotificationCaptureProvider>
      <TelegramProvider>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ScanReceipt"
              component={ScanReceiptScreen}
              options={{
                presentation: 'fullScreenModal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ExportSheet"
              component={ExportSheetScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CategoryPicker"
              component={CategoryPickerScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="BudgetSettings"
              component={BudgetSettingsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="UpcomingForm"
              component={UpcomingFormScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TelegramProvider>
      </NotificationCaptureProvider>
      </WeeklyReportProvider>
      </UpcomingProvider>
      </BudgetsProvider>
      </DatabaseGate>
    </TransactionsProvider>
  );
}

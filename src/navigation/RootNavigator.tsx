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
import { ProfileProvider } from '../store/ProfileContext';
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
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { AppLockSetupScreen } from '../screens/AppLockSetupScreen';
import { AccountsProvider } from '../store/AccountsContext';
import { AccountsScreen } from '../screens/AccountsScreen';
import { AccountFormScreen } from '../screens/AccountFormScreen';
import { AdjustBalanceScreen } from '../screens/AdjustBalanceScreen';
import { GoalsProvider } from '../store/GoalsContext';
import { GoalsScreen } from '../screens/GoalsScreen';
import { GoalFormScreen } from '../screens/GoalFormScreen';
import { GoalMoveScreen } from '../screens/GoalMoveScreen';

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
      <GoalsProvider>
      <AccountsProvider>
      <BudgetsProvider>
      <UpcomingProvider>
      <WeeklyReportProvider>
      <NotificationCaptureProvider>
      <ProfileProvider>
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
              name="Accounts"
              component={AccountsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AccountForm"
              component={AccountFormScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AdjustBalance"
              component={AdjustBalanceScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Goals"
              component={GoalsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="GoalForm"
              component={GoalFormScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="GoalMove"
              component={GoalMoveScreen}
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
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AppLockSetup"
              component={AppLockSetupScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TelegramProvider>
      </ProfileProvider>
      </NotificationCaptureProvider>
      </WeeklyReportProvider>
      </UpcomingProvider>
      </BudgetsProvider>
      </AccountsProvider>
      </GoalsProvider>
      </DatabaseGate>
    </TransactionsProvider>
  );
}

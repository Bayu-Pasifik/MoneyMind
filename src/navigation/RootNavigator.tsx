import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { TransactionsProvider } from '../store/TransactionsContext';
import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TransactionsProvider>
  );
}

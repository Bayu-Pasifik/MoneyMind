import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { TransactionRow } from '../components/TransactionRow';
import { RootStackParamList } from '../navigation/types';

/**
 * Minimal list to host the transaction-detail drawer (F8). Grouping, swipe
 * actions and the empty state are the full F3 feature, built next.
 */
export function TransactionsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { transactions } = useTransactions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        accessibilityRole="header"
        style={{
          color: colors.textPrimary,
          fontSize: typography.size.xxl,
          fontWeight: typography.weight.bold,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.lg,
        }}
      >
        Transactions
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onPress={(transaction) =>
              navigation.navigate('TransactionDetail', { transactionId: transaction.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

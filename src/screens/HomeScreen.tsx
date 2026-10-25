import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { BalanceHero } from '../components/BalanceHero';
import { BudgetCard } from '../components/BudgetCard';
import { QuickActions } from '../components/QuickActions';
import { AiInsightCard } from '../components/AiInsightCard';
import { TransactionRow } from '../components/TransactionRow';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../navigation/types';
import { Transaction } from '../types/transaction';
import { generateHomeInsight } from '../utils/insight';

const MONTHLY_BUDGET = 5000000;
const RECENT_COUNT = 5;

export function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const { transactions, balance, totalIncome, totalExpense } = useTransactions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_COUNT);

  const insight = useMemo(() => generateHomeInsight(transactions), [transactions]);

  const handlePress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const quickActions = [
    {
      key: 'scan',
      label: 'Scan Receipt',
      icon: 'camera-outline' as const,
      iconColor: colors.primary,
      iconBg: colors.primaryLight,
      onPress: () => navigation.navigate('ScanReceipt'),
    },
    {
      key: 'manual',
      label: 'Add Manual',
      icon: 'add-circle-outline' as const,
      iconColor: colors.successText,
      iconBg: '#E6FAF4',
      onPress: () => navigation.navigate('AddTransaction'),
    },
    {
      key: 'chat',
      label: 'AI Chat',
      icon: 'chatbubble-ellipses-outline' as const,
      iconColor: colors.telegram,
      iconBg: '#E3F5FC',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Chat' }),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.textPrimary,
                fontSize: typography.size.xxl,
                fontWeight: typography.weight.bold,
                paddingTop: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              Hi there
            </Text>
            <BalanceHero balance={balance} income={totalIncome} expense={totalExpense} />
            <View style={{ marginTop: spacing.lg }}>
              <QuickActions actions={quickActions} />
            </View>
            <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
              <BudgetCard spent={totalExpense} limit={MONTHLY_BUDGET} />
            </View>
            <View style={{ marginBottom: spacing.lg }}>
              <AiInsightCard
                message={insight}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
              />
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
                marginBottom: spacing.md,
              }}
            >
              Recent transactions
            </Text>
          </View>
        }
        renderItem={({ item }) => <TransactionRow transaction={item} onPress={handlePress} />}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="No activity yet"
            description="Transactions you add will show up here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

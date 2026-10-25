import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { BalanceHero } from '../components/BalanceHero';
import { CategoryBudgets } from '../components/CategoryBudgets';
import { QuickActions } from '../components/QuickActions';
import { AiInsightCard } from '../components/AiInsightCard';
import { NotifCaptureBanner } from '../components/NotifCaptureBanner';
import { TransactionRow } from '../components/TransactionRow';
import { EmptyState } from '../components/EmptyState';
import { UpcomingList } from '../components/UpcomingList';
import { RootStackParamList } from '../navigation/types';
import { Transaction } from '../types/transaction';
import { UpcomingTransaction } from '../types/upcoming';
import { generateHomeInsight } from '../utils/insight';
import { useNotificationCapture } from '../store/NotificationCaptureContext';
import { useUpcoming } from '../store/UpcomingContext';
import { useAnnounce } from '../hooks/useAnnounce';

const RECENT_COUNT = 5;

export function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const { transactions, balance, totalIncome, totalExpense, addTransaction } = useTransactions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { enabled: captureEnabled } = useNotificationCapture();
  const { items: upcomingItems, removeItem: removeUpcoming, rescheduleItem } = useUpcoming();
  const announce = useAnnounce();

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_COUNT);

  const insight = useMemo(() => generateHomeInsight(transactions), [transactions]);

  const capturedToday = useMemo(() => {
    const today = new Date();
    return transactions.filter((item) => {
      if (item.source !== 'notification') return false;
      const date = new Date(item.date);
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [transactions]);

  const handlePress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handleMarkUpcomingPaid = (item: UpcomingTransaction) => {
    addTransaction({
      id: `upcoming-paid-${Date.now()}`,
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      date: new Date().toISOString(),
      accountName: 'Cash Wallet',
      source: 'manual',
    });
    if (item.recurring) {
      rescheduleItem(item.id);
      announce(`${item.title} marked paid and rescheduled for next month`);
    } else {
      removeUpcoming(item.id);
      announce(`${item.title} marked paid`);
    }
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
            {captureEnabled && capturedToday > 0 ? (
              <View style={{ marginTop: spacing.lg }}>
                <NotifCaptureBanner
                  count={capturedToday}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}
                />
              </View>
            ) : null}
            <View style={{ marginTop: spacing.lg }}>
              <QuickActions actions={quickActions} />
            </View>
            <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
              <CategoryBudgets
                transactions={transactions}
                onManage={() => navigation.navigate('BudgetSettings')}
              />
            </View>
            <View style={{ marginBottom: spacing.lg }}>
              <AiInsightCard
                message={insight}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
              />
            </View>
            <View style={{ marginBottom: spacing.lg }}>
              <UpcomingList
                items={upcomingItems}
                onAdd={() => navigation.navigate('UpcomingForm')}
                onPressItem={(item) => navigation.navigate('UpcomingForm', { itemId: item.id })}
                onMarkPaid={handleMarkUpcomingPaid}
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

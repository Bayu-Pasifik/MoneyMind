import React, { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { SwipeableTransactionRow } from '../components/SwipeableTransactionRow';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../navigation/types';
import { groupTransactionsByDay } from '../utils/groupTransactions';
import { Transaction } from '../types/transaction';
import { useAnnounce } from '../hooks/useAnnounce';

export function TransactionsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { transactions, removeTransaction } = useTransactions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const announce = useAnnounce();

  const sections = useMemo(() => groupTransactionsByDay(transactions), [transactions]);

  const handlePress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handleDelete = (transaction: Transaction) => {
    removeTransaction(transaction.id);
    announce(`Deleted ${transaction.title}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xxl,
            fontWeight: typography.weight.bold,
          }}
        >
          Transactions
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan a receipt"
          onPress={() => navigation.navigate('ScanReceipt')}
          style={[styles.scanButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="camera-outline" size={20} color={colors.primaryText} />
        </Pressable>
      </View>
      {transactions.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No transactions yet"
          description="Add your first income or expense, or scan a receipt, to see it here."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingVertical: spacing.sm }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                }}
              >
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SwipeableTransactionRow
              transaction={item}
              onPress={handlePress}
              onDelete={handleDelete}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

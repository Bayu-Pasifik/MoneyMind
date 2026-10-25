import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { formatCurrency, formatDateTime } from '../utils/format';
import { RootStackParamList } from '../navigation/types';
import { useAnnounce } from '../hooks/useAnnounce';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionDetail'>;

const CATEGORY_LABEL: Record<string, string> = {
  food: 'Food & Drink',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  health: 'Health',
  entertainment: 'Entertainment',
  salary: 'Salary',
  transfer: 'Transfer',
  other: 'Other',
};

export function TransactionDetailScreen({ route, navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { getById, removeTransaction } = useTransactions();
  const announce = useAnnounce();
  const transaction = getById(route.params.transactionId);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: spacing.lg }}>
          This transaction is no longer available.
        </Text>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;

  const handleDelete = () => {
    removeTransaction(transaction.id);
    announce('Transaction deleted');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={[styles.closeButton, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill }]}
          >
            <Ionicons name="close" size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit transaction"
            hitSlop={8}
            onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}
            style={[styles.closeButton, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill }]}
          >
            <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.size.sm,
            marginTop: spacing.lg,
          }}
        >
          {CATEGORY_LABEL[transaction.category]} · {transaction.accountName}
        </Text>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginTop: spacing.xs,
          }}
        >
          {transaction.title}
        </Text>
        <Text
          style={{
            color: amountColor,
            fontSize: typography.size.display,
            fontWeight: typography.weight.bold,
            marginTop: spacing.md,
          }}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm, marginTop: spacing.xs }}>
          {formatDateTime(transaction.date)}
        </Text>

        {transaction.note ? (
          <View style={[styles.section, { borderTopColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.lg }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>Note</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, marginTop: spacing.xs }}>
              {transaction.note}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete transaction"
          onPress={handleDelete}
          style={[
            styles.deleteButton,
            { borderColor: colors.dangerText, borderRadius: radii.md, marginTop: spacing.xxl, padding: spacing.md },
          ]}
        >
          <Text style={{ color: colors.dangerText, fontWeight: typography.weight.semibold }}>
            Delete transaction
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    borderTopWidth: 1,
  },
  deleteButton: {
    borderWidth: 1,
    alignItems: 'center',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Transaction } from '../types/transaction';
import { formatCurrency, formatDate } from '../utils/format';
import { SourcePill } from './SourcePill';

const CATEGORY_ICON: Record<Transaction['category'], keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  transport: 'car-outline',
  shopping: 'bag-outline',
  bills: 'receipt-outline',
  health: 'medkit-outline',
  entertainment: 'film-outline',
  salary: 'cash-outline',
  transfer: 'swap-horizontal-outline',
  other: 'ellipsis-horizontal-circle-outline',
};

type Props = {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
};

export function TransactionRow({ transaction, onPress }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const isIncome = transaction.type === 'income';
  const sign = isIncome ? '+' : '-';
  const amountColor = isIncome ? colors.income : colors.expense;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${transaction.title}, ${sign}${formatCurrency(transaction.amount)}`}
      onPress={() => onPress(transaction)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginRight: spacing.md },
        ]}
      >
        <Ionicons name={CATEGORY_ICON[transaction.category]} size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.middle}>
        <Text
          style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}
          numberOfLines={1}
        >
          {transaction.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm, marginRight: spacing.xs }}>
            {formatDate(transaction.date)}
          </Text>
          <SourcePill source={transaction.source} />
        </View>
      </View>
      <Text style={{ color: amountColor, fontSize: typography.size.md, fontWeight: typography.weight.bold }}>
        {sign}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});

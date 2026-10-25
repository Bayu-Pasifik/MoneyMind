import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Transaction, TransactionCategory } from '../types/transaction';
import { useBudgets } from '../store/BudgetsContext';
import { BUDGET_STATUS_LABEL, getBudgetStatus } from '../utils/budgets';
import { CATEGORY_LABEL } from '../utils/categories';
import { formatCurrency } from '../utils/format';

type Props = {
  transactions: Transaction[];
  onManage: () => void;
};

const STATUS_COLOR = {
  ok: { bg: '#E6FAF4', text: '#00875B', bar: '#00C48C' },
  warn: { bg: '#FEF7E6', text: '#8F5E00', bar: '#F5A623' },
  over: { bg: '#FEF0F0', text: '#D92D38', bar: '#FF5A5F' },
};

export function CategoryBudgets({ transactions, onManage }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { budgets } = useBudgets();

  const categories = Object.keys(budgets) as TransactionCategory[];
  const rows = categories.map((category) => {
    const limit = budgets[category] ?? 0;
    const spent = transactions
      .filter((item) => item.type === 'expense' && item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
    const status = getBudgetStatus(spent, limit);
    return { category, limit, spent, status };
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
          Category budgets
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage budget limits"
          hitSlop={8}
          onPress={onManage}
        >
          <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Pressable
          onPress={onManage}
          style={[styles.emptyRow, { marginTop: spacing.md }]}
          accessibilityRole="button"
          accessibilityLabel="Set a budget limit per category"
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginLeft: spacing.sm }}>
            Set a budget limit per category
          </Text>
        </Pressable>
      ) : (
        rows.map((row, index) => {
          const ratio = row.limit > 0 ? Math.min(row.spent / row.limit, 1) : 0;
          const palette = STATUS_COLOR[row.status];
          return (
            <View key={row.category} style={{ marginTop: index === 0 ? spacing.md : spacing.md }}>
              <View style={styles.rowHeader}>
                <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
                  {CATEGORY_LABEL[row.category]}
                </Text>
                <View style={styles.rightGroup}>
                  <View style={[styles.badge, { backgroundColor: palette.bg, borderRadius: radii.pill, marginRight: spacing.sm }]}>
                    <Text style={{ color: palette.text, fontSize: 10, fontWeight: '600' }}>
                      {BUDGET_STATUS_LABEL[row.status]}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs }}>
                    {formatCurrency(row.spent)} / {formatCurrency(row.limit)}
                  </Text>
                </View>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
                style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginTop: spacing.xs }]}
              >
                <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: palette.bar, borderRadius: radii.pill }]} />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  track: {
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

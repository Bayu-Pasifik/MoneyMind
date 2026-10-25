import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/format';

type Props = {
  income: number;
  expense: number;
  count: number;
  rangeLabel: string;
};

export const ExportPreviewCard = forwardRef<React.ComponentRef<typeof View>, Props>(function ExportPreviewCard(
  { income, expense, count, rangeLabel },
  ref
) {
  const { colors, spacing, radii, typography } = useTheme();
  const saved = income - expense;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg },
      ]}
    >
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold, marginBottom: 2 }}>
        MoneyMind report
      </Text>
      <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginBottom: spacing.md }}>
        {rangeLabel} · {count} transaction{count === 1 ? '' : 's'}
      </Text>
      <View style={styles.grid}>
        <View style={[styles.cell, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Income</Text>
          <Text style={{ color: colors.successText, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={[styles.cell, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Expenses</Text>
          <Text style={{ color: colors.dangerText, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {formatCurrency(expense)}
          </Text>
        </View>
        <View style={[styles.cell, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Saved</Text>
          <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {formatCurrency(saved)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
  },
});

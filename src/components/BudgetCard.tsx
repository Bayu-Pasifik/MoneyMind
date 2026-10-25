import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/format';

type Props = {
  spent: number;
  limit: number;
};

export function BudgetCard({ spent, limit }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const ratio = limit > 0 ? Math.min(spent / limit, 1) : 0;
  const isOverBudget = spent > limit;
  const barColor = isOverBudget ? colors.danger : colors.primary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.lg, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
          Monthly budget
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
        style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginTop: spacing.md }]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: barColor,
              borderRadius: radii.pill,
            },
          ]}
        />
      </View>
      {isOverBudget ? (
        <Text style={{ color: colors.dangerText, fontSize: typography.size.xs, marginTop: spacing.sm }}>
          Over budget by {formatCurrency(spent - limit)}
        </Text>
      ) : (
        <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginTop: spacing.sm }}>
          {formatCurrency(limit - spent)} remaining this month
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

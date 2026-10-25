import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/format';

type Props = {
  balance: number;
  income: number;
  expense: number;
};

export function BalanceHero({ balance, income, expense }: Props) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderRadius: radii.xl, padding: spacing.xl }]}
    >
      <Text style={[styles.label, { fontSize: typography.size.sm }]}>Total balance</Text>
      <Text
        accessibilityRole="text"
        style={[styles.balance, { fontSize: typography.size.display, marginTop: spacing.xs }]}
      >
        {formatCurrency(balance)}
      </Text>

      <View style={[styles.row, { marginTop: spacing.xl }]}>
        <View style={styles.statItem}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { fontSize: typography.size.md }]}>
              {formatCurrency(income)}
            </Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { fontSize: typography.size.md }]}>
              {formatCurrency(expense)}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  label: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  balance: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  statValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { DonutChart } from '../components/DonutChart';
import { TrendBarChart } from '../components/TrendBarChart';
import { EmptyState } from '../components/EmptyState';
import { getCategoryBreakdown, getLastNDaysExpenseTotals } from '../utils/analytics';
import { CATEGORY_CHART_COLORS, CATEGORY_LABEL } from '../utils/categories';
import { formatCurrency } from '../utils/format';

export function AnalyticsScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions, totalExpense } = useTransactions();

  const breakdown = useMemo(() => getCategoryBreakdown(transactions), [transactions]);
  const trend = useMemo(() => getLastNDaysExpenseTotals(transactions, 7), [transactions]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xxl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.lg,
          }}
        >
          Analytics
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
          ]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            Last 7 days spending
          </Text>
          <TrendBarChart data={trend} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg },
          ]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            Spending by category
          </Text>

          {breakdown.length === 0 ? (
            <EmptyState
              icon="pie-chart-outline"
              title="No spending yet"
              description="Add expenses to see your category breakdown."
            />
          ) : (
            <View style={styles.breakdownRow}>
              <DonutChart data={breakdown} />
              <View style={{ marginLeft: spacing.lg, flex: 1 }}>
                {breakdown.map((slice) => (
                  <View key={slice.category} style={[styles.legendRow, { marginBottom: spacing.sm }]}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: CATEGORY_CHART_COLORS[slice.category], borderRadius: radii.pill, marginRight: spacing.sm },
                      ]}
                    />
                    <Text
                      style={{ color: colors.textPrimary, fontSize: typography.size.sm, flex: 1 }}
                      numberOfLines={1}
                    >
                      {CATEGORY_LABEL[slice.category]}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>
                      {Math.round(slice.ratio * 100)}%
                    </Text>
                  </View>
                ))}
                <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginTop: spacing.xs }}>
                  Total: {formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
  },
});

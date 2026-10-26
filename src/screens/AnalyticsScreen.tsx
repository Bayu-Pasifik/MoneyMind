import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { DonutChart } from '../components/DonutChart';
import { TrendBarChart } from '../components/TrendBarChart';
import { EmptyState } from '../components/EmptyState';
import { PeriodTabs } from '../components/PeriodTabs';
import { SummaryCards } from '../components/SummaryCards';
import { TopMerchants } from '../components/TopMerchants';
import { getCategoryBreakdown, getTrendTotals, TREND_CHART_TITLE } from '../utils/analytics';
import { CATEGORY_CHART_COLORS, CATEGORY_LABEL } from '../utils/categories';
import { formatCurrency } from '../utils/format';
import { filterByPeriod, filterByPreviousPeriod, getTopMerchants, Period, summarizePeriod } from '../utils/period';
import { RootStackParamList } from '../navigation/types';

export function AnalyticsScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions } = useTransactions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [period, setPeriod] = useState<Period>('month');

  const periodTransactions = useMemo(() => filterByPeriod(transactions, period), [transactions, period]);
  const previousPeriodTransactions = useMemo(
    () => filterByPreviousPeriod(transactions, period),
    [transactions, period]
  );
  const summary = useMemo(
    () => summarizePeriod(periodTransactions, previousPeriodTransactions),
    [periodTransactions, previousPeriodTransactions]
  );
  const topMerchants = useMemo(() => getTopMerchants(periodTransactions), [periodTransactions]);

  const breakdown = useMemo(() => getCategoryBreakdown(periodTransactions), [periodTransactions]);
  const trend = useMemo(() => getTrendTotals(transactions, period), [transactions, period]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={[styles.headerRow, { marginBottom: spacing.lg }]}>
          <Text
            accessibilityRole="header"
            style={{
              color: colors.textPrimary,
              fontSize: typography.size.xxl,
              fontWeight: typography.weight.bold,
            }}
          >
            Analytics
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export report"
            hitSlop={8}
            onPress={() => navigation.navigate('ExportSheet')}
            style={[styles.exportButton, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill }]}
          >
            <Ionicons name="download-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <PeriodTabs value={period} onChange={setPeriod} />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <SummaryCards summary={summary} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
          ]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            {TREND_CHART_TITLE[period]}
          </Text>
          <TrendBarChart data={trend} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
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
                  Total: {formatCurrency(summary.spent)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg },
          ]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            Top merchants
          </Text>
          {topMerchants.length === 0 ? (
            <EmptyState
              icon="storefront-outline"
              title="No merchants yet"
              description="Spending by merchant will show up here."
            />
          ) : (
            <TopMerchants merchants={topMerchants} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exportButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { PeriodSummary } from '../utils/period';
import { formatCurrency } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  summary: PeriodSummary;
};

function DeltaLabel({ delta, positiveIsGood }: { delta: number | null; positiveIsGood: boolean }) {
  const { colors, typography } = useTheme();
  const { t } = useLocale();
  if (delta === null) return null;
  const isGood = positiveIsGood ? delta >= 0 : delta <= 0;
  const color = isGood ? colors.successText : colors.dangerText;
  const sign = delta >= 0 ? '+' : '';
  return (
    <Text style={{ color, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
      {t('summary.vsLastPeriod', { sign, delta: delta.toFixed(0) })}
    </Text>
  );
}

function SavingRateLabel({ summary }: { summary: PeriodSummary }) {
  const { colors, typography } = useTheme();
  const { t } = useLocale();
  if (summary.income <= 0) return null;
  const rate = Math.round((summary.saved / summary.income) * 100);
  const color = rate >= 0 ? colors.successText : colors.dangerText;
  return (
    <Text style={{ color, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
      {t('summary.savingRate', { rate })}
    </Text>
  );
}

export function SummaryCards({ summary }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();

  const items = [
    { key: 'spent', label: t('summary.spent'), value: summary.spent, delta: summary.spentDelta, positiveIsGood: false },
    { key: 'income', label: t('summary.income'), value: summary.income, delta: summary.incomeDelta, positiveIsGood: true },
    { key: 'saved', label: t('summary.saved'), value: summary.saved, delta: null, positiveIsGood: true, showRate: true },
    { key: 'count', label: t('summary.transactions'), value: summary.count, delta: null, positiveIsGood: true, isCount: true },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.key}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, padding: spacing.md },
          ]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginBottom: spacing.xs }}>
            {item.label}
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}>
            {item.isCount ? item.value : formatCurrency(item.value)}
          </Text>
          {item.delta !== null ? <DeltaLabel delta={item.delta} positiveIsGood={item.positiveIsGood} /> : null}
          {item.showRate ? <SavingRateLabel summary={summary} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    borderWidth: 1,
  },
});

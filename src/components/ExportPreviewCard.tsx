import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatCurrency } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

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
  const { t } = useLocale();
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
        {t('export.reportTitle')}
      </Text>
      <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginBottom: spacing.md }}>
        {rangeLabel} · {t(count === 1 ? 'merchant.transactionCountOne' : 'merchant.transactionCountOther', { count })}
      </Text>
      <View style={styles.grid}>
        <View style={[styles.cell, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{t('balance.income')}</Text>
          <Text style={{ color: colors.successText, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={[styles.cell, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{t('balance.expense')}</Text>
          <Text style={{ color: colors.dangerText, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {formatCurrency(expense)}
          </Text>
        </View>
        <View style={[styles.cell, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{t('export.saved')}</Text>
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

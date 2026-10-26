import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { MerchantTotal } from '../utils/period';
import { formatCurrency } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  merchants: MerchantTotal[];
};

export function TopMerchants({ merchants }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();

  return (
    <View>
      {merchants.map((merchant, index) => (
        <View
          key={merchant.merchant}
          style={[
            styles.row,
            { paddingVertical: spacing.sm, borderBottomColor: colors.border, borderBottomWidth: index === merchants.length - 1 ? 0 : 1 },
          ]}
        >
          <View style={[styles.rank, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginRight: spacing.sm }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{index + 1}</Text>
          </View>
          <View style={styles.info}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }} numberOfLines={1}>
              {merchant.merchant}
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs }}>
              {t(merchant.count === 1 ? 'merchant.transactionCountOne' : 'merchant.transactionCountOther', { count: merchant.count })}
            </Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {formatCurrency(merchant.total)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
});

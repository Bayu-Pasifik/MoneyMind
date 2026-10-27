import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAccounts } from '../store/AccountsContext';
import { formatCurrency } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  onManage: () => void;
};

/** Per-account balances listed under the Total assets hero on Home. */
export function AccountBalances({ onManage }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { accounts, balances } = useAccounts();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, padding: spacing.lg }]}>
      <View style={[styles.header, { marginBottom: spacing.sm }]}>
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}
        >
          {t('accounts.homeTitle')}
        </Text>
        <Pressable accessibilityRole="button" onPress={onManage} hitSlop={8}>
          <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
            {t('accounts.manage')}
          </Text>
        </Pressable>
      </View>
      {accounts.map((account) => (
        <View key={account.id} style={[styles.row, { paddingVertical: spacing.xs }]}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>{account.name}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
            {formatCurrency(balances[account.id] ?? 0)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});

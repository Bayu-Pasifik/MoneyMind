import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAccounts } from '../store/AccountsContext';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  value: string | undefined;
  onChange: (accountId: string) => void;
};

/** Chip row for choosing an account. An unset value shows the default account as selected. */
export function AccountPicker({ value, onChange }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { accounts, resolveId } = useAccounts();
  const selectedId = resolveId(value);

  return (
    <View>
      <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
        {t('accounts.fieldLabel')}
      </Text>
      <View style={[styles.wrap, { marginBottom: spacing.lg }]}>
        {accounts.map((account) => {
          const selected = account.id === selectedId;
          return (
            <Pressable
              key={account.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(account.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primaryLight : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? colors.primary : colors.textSecondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                }}
              >
                {account.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1 },
});

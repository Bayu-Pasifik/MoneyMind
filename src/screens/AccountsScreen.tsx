import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAccounts } from '../store/AccountsContext';
import { RootStackParamList } from '../navigation/types';
import { formatCurrency } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Accounts'>;

export function AccountsScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { accounts, balances, totalAssets } = useAccounts();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}
        >
          {t('accounts.title')}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          {t('accounts.subtitle')}
        </Text>

        <View style={[styles.totalCard, { backgroundColor: colors.primaryLight, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.lg }]}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>{t('balance.total')}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold }}>
            {formatCurrency(totalAssets)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card }]}>
          {accounts.map((account, index) => (
            <View
              key={account.id}
              style={[
                styles.row,
                {
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderBottomWidth: index === accounts.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('accounts.edit', { name: account.name })}
                onPress={() => navigation.navigate('AccountForm', { accountId: account.id })}
                style={{ flex: 1 }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
                  {account.name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>
                  {formatCurrency(balances[account.id] ?? 0)}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('accounts.adjustFor', { name: account.name })}
                onPress={() => navigation.navigate('AdjustBalance', { accountId: account.id })}
                style={[styles.adjustButton, { borderColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}
              >
                <Text style={{ color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
                  {t('accounts.adjust')}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AccountForm')}
          style={[styles.addButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.lg }]}
        >
          <Ionicons name="add" size={18} color={colors.primaryText} />
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold, marginLeft: spacing.xs }}>
            {t('accounts.add')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  totalCard: {},
  card: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  adjustButton: { borderWidth: 1 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

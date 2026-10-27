import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAccounts } from '../store/AccountsContext';
import { useGoals } from '../store/GoalsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { AccountPicker } from '../components/AccountPicker';
import { RootStackParamList } from '../navigation/types';
import { formatAmountInput, formatCurrency, parseAmountInput } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalMove'>;

export function GoalMoveScreen({ navigation, route }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { getById, saved, addEntry } = useGoals();
  const { balances, resolveId, getById: getAccountById } = useAccounts();
  const announce = useAnnounce();

  const { goalId, mode } = route.params;
  const goal = getById(goalId);
  const isDeposit = mode === 'deposit';

  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState('');

  if (!goal) {
    return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const inGoal = saved[goal.id] ?? 0;
  const resolvedAccountId = resolveId(accountId);

  const handleSave = () => {
    const parsed = parseAmountInput(amount);
    if (parsed <= 0 || resolvedAccountId === undefined) {
      announce(t('goalMove.validation'));
      return;
    }
    if (isDeposit) {
      const available = balances[resolvedAccountId] ?? 0;
      if (parsed > available) {
        const name = getAccountById(resolvedAccountId)?.name ?? '';
        announce(t('goalMove.insufficientAccount', { name, amount: formatCurrency(available) }));
        return;
      }
    } else if (parsed > inGoal) {
      announce(t('goalMove.insufficientGoal', { amount: formatCurrency(inGoal) }));
      return;
    }
    addEntry(goal.id, resolvedAccountId, isDeposit ? parsed : -parsed);
    announce(isDeposit ? t('goalMove.depositDone') : t('goalMove.withdrawDone'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}
        >
          {isDeposit ? t('goalMove.depositTitle') : t('goalMove.withdrawTitle')} · {goal.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          {t('goalMove.inGoal', { amount: formatCurrency(inGoal) })}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {isDeposit ? t('goalMove.depositAccount') : t('goalMove.withdrawAccount')}
        </Text>
        <AccountPicker value={accountId} onChange={setAccountId} />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {t('goalMove.amountLabel')}
        </Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(formatAmountInput(text))}
          accessibilityLabel={t('goalMove.amountLabel')}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          autoFocus
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.xxl }]}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
            {isDeposit ? t('goalMove.saveDeposit') : t('goalMove.saveWithdraw')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  saveButton: { alignItems: 'center' },
});

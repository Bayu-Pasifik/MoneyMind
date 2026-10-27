import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAccounts } from '../store/AccountsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { formatAmountInput, formatCurrency, parseAmountInput } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AdjustBalance'>;

type Mode = 'decrease' | 'increase' | 'set';

const MODES: Mode[] = ['decrease', 'increase', 'set'];

export function AdjustBalanceScreen({ navigation, route }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { getById, balances, addAdjustment } = useAccounts();
  const announce = useAnnounce();

  const account = getById(route.params.accountId);
  const [mode, setMode] = useState<Mode>('decrease');
  const [amount, setAmount] = useState('');

  if (!account) {
    return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const current = balances[account.id] ?? 0;
  const parsed = parseAmountInput(amount);
  const delta = mode === 'decrease' ? -parsed : mode === 'increase' ? parsed : parsed - current;
  const next = current + delta;

  const handleSave = () => {
    if (!parsed && mode !== 'set') {
      announce(t('adjust.validation'));
      return;
    }
    if (mode === 'set' && amount.trim() === '') {
      announce(t('adjust.validation'));
      return;
    }
    if (delta === 0) {
      announce(t('adjust.unchanged', { amount: formatCurrency(current) }));
      return;
    }
    addAdjustment(account.id, delta);
    announce(t('adjust.done'));
    navigation.goBack();
  };

  const modeLabel: Record<Mode, string> = {
    decrease: t('adjust.decrease'),
    increase: t('adjust.increase'),
    set: t('adjust.set'),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}
        >
          {t('adjust.title')} · {account.name}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          {t('adjust.current', { amount: formatCurrency(current) })}
        </Text>

        <View style={[styles.modeRow, { marginBottom: spacing.lg }]}>
          {MODES.map((option) => {
            const selected = option === mode;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setMode(option)}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Text style={{ color: selected ? colors.primaryText : colors.textPrimary, fontWeight: typography.weight.semibold }}>
                  {modeLabel[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {mode === 'set' ? t('adjust.setLabel') : t('adjust.amountLabel')}
        </Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(formatAmountInput(text))}
          accessibilityLabel={mode === 'set' ? t('adjust.setLabel') : t('adjust.amountLabel')}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          autoFocus
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.sm }]}
        />
        <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm, marginBottom: spacing.xxl }}>
          {t('adjust.preview', { amount: formatCurrency(next) })}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>{t('adjust.save')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  modeChip: { borderWidth: 1 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  saveButton: { alignItems: 'center' },
});

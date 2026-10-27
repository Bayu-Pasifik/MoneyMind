import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAccounts } from '../store/AccountsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { formatAmountInput, formatCurrency, formatDate, parseAmountInput } from '../utils/format';
import { DEFAULT_ACCOUNT_ID } from '../utils/accounts';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountForm'>;

export function AccountFormScreen({ navigation, route }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t, locale } = useLocale();
  const { getById, addAccount, updateAccount, removeAccount, adjustments, removeAdjustment } = useAccounts();
  const announce = useAnnounce();

  const editingId = route.params?.accountId;
  const existing = editingId ? getById(editingId) : undefined;
  const isEditing = Boolean(existing);
  const isDefault = existing?.id === DEFAULT_ACCOUNT_ID;
  const history = existing ? adjustments.filter((item) => item.accountId === existing.id) : [];

  const [name, setName] = useState(existing?.name ?? '');
  const [opening, setOpening] = useState(
    existing && existing.openingBalance > 0 ? formatAmountInput(String(existing.openingBalance)) : ''
  );

  const handleSave = () => {
    if (!name.trim()) {
      announce(t('accountForm.validationName'));
      return;
    }
    const openingBalance = parseAmountInput(opening);
    if (existing) {
      updateAccount({ ...existing, name: name.trim(), openingBalance });
      announce(t('accountForm.updated'));
    } else {
      addAccount(name.trim(), openingBalance);
      announce(t('accountForm.added'));
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing || isDefault) return;
    removeAccount(existing.id);
    announce(t('accountForm.deleted'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.lg }}
        >
          {isEditing ? t('accountForm.editTitle') : t('accountForm.addTitle')}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {t('accountForm.nameLabel')}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          accessibilityLabel={t('accountForm.nameLabel')}
          placeholder={t('accountForm.namePlaceholder')}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg }]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {t('accountForm.openingLabel')}
        </Text>
        <TextInput
          value={opening}
          onChangeText={(text) => setOpening(formatAmountInput(text))}
          accessibilityLabel={t('accountForm.openingLabel')}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.xxl }]}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={[styles.button, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>{t('accountForm.save')}</Text>
        </Pressable>

        {isEditing ? (
          <>
            <Text
              accessibilityRole="header"
              style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold, marginTop: spacing.xxl, marginBottom: spacing.sm }}
            >
              {t('accountForm.historyTitle')}
            </Text>
            {history.length === 0 ? (
              <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm }}>{t('accountForm.historyEmpty')}</Text>
            ) : (
              history.map((item) => (
                <View key={item.id} style={[styles.historyRow, { paddingVertical: spacing.xs }]}>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, flex: 1 }}>
                    {formatDate(item.date, locale)}
                  </Text>
                  <Text
                    style={{
                      color: item.amount < 0 ? colors.expense : colors.income,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.semibold,
                    }}
                  >
                    {item.amount > 0 ? '+' : ''}
                    {formatCurrency(item.amount)}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('accountForm.removeAdjustment')}
                    hitSlop={8}
                    onPress={() => removeAdjustment(item.id)}
                    style={{ marginLeft: spacing.sm }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))
            )}

            {isDefault ? (
              <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginTop: spacing.xl }}>
                {t('accountForm.defaultNote')}
              </Text>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleDelete}
                  style={[styles.button, styles.deleteButton, { borderColor: colors.dangerText, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.xl }]}
                >
                  <Text style={{ color: colors.dangerText, fontWeight: typography.weight.semibold }}>
                    {t('accountForm.delete')}
                  </Text>
                </Pressable>
                <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginTop: spacing.xs, textAlign: 'center' }}>
                  {t('accountForm.deleteNote')}
                </Text>
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  button: { alignItems: 'center' },
  deleteButton: { borderWidth: 1 },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
});

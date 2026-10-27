import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useGoals } from '../store/GoalsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { formatAmountInput, parseAmountInput } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'GoalForm'>;

export function GoalFormScreen({ navigation, route }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { getById, addGoal, updateGoal, removeGoal } = useGoals();
  const announce = useAnnounce();

  const editingId = route.params?.goalId;
  const existing = editingId ? getById(editingId) : undefined;
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [target, setTarget] = useState(existing ? formatAmountInput(String(existing.targetAmount)) : '');

  const handleSave = () => {
    if (!name.trim()) {
      announce(t('goalForm.validationName'));
      return;
    }
    const targetAmount = parseAmountInput(target);
    if (targetAmount <= 0) {
      announce(t('goalForm.validationTarget'));
      return;
    }
    if (existing) {
      updateGoal({ ...existing, name: name.trim(), targetAmount });
      announce(t('goalForm.updated'));
    } else {
      addGoal(name.trim(), targetAmount);
      announce(t('goalForm.added'));
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) return;
    removeGoal(existing.id);
    announce(t('goalForm.deleted'));
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
          {isEditing ? t('goalForm.editTitle') : t('goalForm.addTitle')}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {t('goalForm.nameLabel')}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          accessibilityLabel={t('goalForm.nameLabel')}
          placeholder={t('goalForm.namePlaceholder')}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg }]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {t('goalForm.targetLabel')}
        </Text>
        <TextInput
          value={target}
          onChangeText={(text) => setTarget(formatAmountInput(text))}
          accessibilityLabel={t('goalForm.targetLabel')}
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
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>{t('goalForm.save')}</Text>
        </Pressable>

        {isEditing ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton, { borderColor: colors.dangerText, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.xl }]}
            >
              <Text style={{ color: colors.dangerText, fontWeight: typography.weight.semibold }}>{t('goalForm.delete')}</Text>
            </Pressable>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginTop: spacing.xs, textAlign: 'center' }}>
              {t('goalForm.deleteNote')}
            </Text>
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
});

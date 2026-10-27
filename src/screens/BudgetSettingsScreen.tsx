import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useBudgets } from '../store/BudgetsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { getCategoryLabel } from '../utils/categories';
import { formatAmountInput, formatCurrency, parseAmountInput } from '../utils/format';
import { BUDGETABLE_CATEGORIES } from '../utils/budgets';
import { TransactionCategory } from '../types/transaction';
import { useLocale } from '../i18n/LocaleContext';

export function BudgetSettingsScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { budgets, setLimit, removeLimit } = useBudgets();
  const announce = useAnnounce();

  const [drafts, setDrafts] = useState<Partial<Record<TransactionCategory, string>>>({});

  const getDisplayValue = (category: TransactionCategory) => {
    if (drafts[category] !== undefined) return drafts[category] as string;
    return budgets[category] !== undefined ? formatAmountInput(String(budgets[category]), false) : '';
  };

  const handleChange = (category: TransactionCategory, text: string) => {
    setDrafts((prev) => ({ ...prev, [category]: formatAmountInput(text, false) }));
  };

  const handleBlur = (category: TransactionCategory) => {
    const draft = drafts[category];
    if (draft === undefined) return;
    const trimmed = draft.trim();
    if (trimmed === '') {
      removeLimit(category);
      announce(t('budgetSettings.removedAnnounce', { category: getCategoryLabel(t, category) }));
    } else {
      const parsed = parseAmountInput(trimmed);
      if (parsed > 0) {
        setLimit(category, parsed);
        announce(t('budgetSettings.setAnnounce', { category: getCategoryLabel(t, category), amount: formatCurrency(parsed) }));
      }
    }
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.xs,
          }}
        >
          {t('budgetSettings.title')}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          {t('budgetSettings.subtitle')}
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card },
          ]}
        >
          {BUDGETABLE_CATEGORIES.map((category, index) => (
            <View
              key={category}
              style={[
                styles.row,
                {
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderBottomWidth: index === BUDGETABLE_CATEGORIES.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, flex: 1 }}>
                {getCategoryLabel(t, category)}
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: colors.surfaceAlt, borderRadius: radii.sm, paddingHorizontal: spacing.sm },
                ]}
              >
                <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm, marginRight: 2 }}>Rp</Text>
                <TextInput
                  value={getDisplayValue(category)}
                  onChangeText={(text) => handleChange(category, text)}
                  onBlur={() => handleBlur(category)}
                  accessibilityLabel={t('budgetSettings.monthlyLimitFor', { category: getCategoryLabel(t, category) })}
                  placeholder={t('budgetSettings.noLimit')}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={{ color: colors.textPrimary, fontSize: typography.size.sm, paddingVertical: spacing.sm, minWidth: 90, textAlign: 'right' }}
                />
              </View>
              {budgets[category] !== undefined ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('budgetSettings.removeFor', { category: getCategoryLabel(t, category) })}
                  hitSlop={8}
                  onPress={() => {
                    removeLimit(category);
                    announce(t('budgetSettings.removedAnnounce', { category: getCategoryLabel(t, category) }));
                  }}
                  style={{ marginLeft: spacing.sm }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

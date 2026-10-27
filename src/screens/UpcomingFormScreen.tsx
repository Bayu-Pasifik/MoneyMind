import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useUpcoming } from '../store/UpcomingContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { TransactionCategory, TransactionType } from '../types/transaction';
import { UpcomingTransaction } from '../types/upcoming';
import { getCategoryLabel } from '../utils/categories';
import { formatAmountInput, formatDate, parseAmountInput } from '../utils/format';
import { fromDateInputValue, toDateInputValue } from '../utils/dateInput';
import { useLocale } from '../i18n/LocaleContext';
import { useAccounts } from '../store/AccountsContext';
import { AccountPicker } from '../components/AccountPicker';

type Props = NativeStackScreenProps<RootStackParamList, 'UpcomingForm'>;

const EXPENSE_CATEGORIES: TransactionCategory[] = ['bills', 'entertainment', 'food', 'transport', 'shopping', 'health', 'other'];
const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'transfer', 'other'];

export function UpcomingFormScreen({ navigation, route }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t, locale } = useLocale();
  const { addItem, updateItem, removeItem, getById } = useUpcoming();
  const announce = useAnnounce();

  const editingId = route.params?.itemId;
  const existing = editingId ? getById(editingId) : undefined;
  const isEditing = Boolean(existing);

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [amount, setAmount] = useState(existing ? formatAmountInput(String(existing.amount)) : '');
  const [category, setCategory] = useState<TransactionCategory>(existing?.category ?? 'bills');
  const [dateText, setDateText] = useState(
    existing ? toDateInputValue(existing.dueDate) : toDateInputValue(new Date().toISOString())
  );
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);
  const { resolveId } = useAccounts();
  const [accountId, setAccountId] = useState<string | undefined>(resolveId(existing?.accountId));

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (next: TransactionType) => {
    setType(next);
    const nextCategories = next === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!nextCategories.includes(category)) {
      setCategory(nextCategories[0]);
    }
  };

  const handleSave = () => {
    const parsedAmount = parseAmountInput(amount);
    const dueDate = fromDateInputValue(dateText);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) {
      announce(t('upcomingForm.validationMissing'));
      return;
    }
    if (!dueDate) {
      announce(t('upcomingForm.validationDate'));
      return;
    }

    if (existing) {
      const updated: UpcomingTransaction = { ...existing, title: title.trim(), amount: parsedAmount, type, category, dueDate, recurring, accountId };
      updateItem(updated);
      announce(t('upcomingForm.updated'));
    } else {
      const item: UpcomingTransaction = {
        id: `upcoming-${Date.now()}`,
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        dueDate,
        recurring,
        accountId,
      };
      addItem(item);
      announce(t('upcomingForm.added'));
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) return;
    removeItem(existing.id);
    announce(t('upcomingForm.removed'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.lg }}
        >
          {isEditing ? t('upcomingForm.editTitle') : t('upcomingForm.addTitle')}
        </Text>

        <View style={[styles.typeRow, { marginBottom: spacing.lg }]}>
          {(['expense', 'income'] as TransactionType[]).map((option) => {
            const selected = option === type;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => handleTypeChange(option)}
                style={[
                  styles.typeChip,
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
                  {option === 'expense' ? t('addTransaction.expense') : t('addTransaction.income')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>{t('addTransaction.titleLabel')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          accessibilityLabel={t('addTransaction.titleLabel')}
          placeholder={t('upcomingForm.titlePlaceholder')}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg }]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>{t('addTransaction.amountLabel')}</Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(formatAmountInput(text))}
          accessibilityLabel={t('addTransaction.amountLabel')}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg }]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          {t('upcomingForm.dueDateLabel')}
        </Text>
        <TextInput
          value={dateText}
          onChangeText={setDateText}
          accessibilityLabel={t('upcomingForm.dueDateLabel')}
          placeholder={toDateInputValue(new Date().toISOString())}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.xs }]}
        />
        {fromDateInputValue(dateText) ? (
          <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginBottom: spacing.lg }}>
            {formatDate(fromDateInputValue(dateText)!, locale)}
          </Text>
        ) : (
          <Text style={{ color: colors.dangerText, fontSize: typography.size.xs, marginBottom: spacing.lg }}>
            {t('addTransaction.dateInvalid', { example: toDateInputValue(new Date().toISOString()) })}
          </Text>
        )}

        <View style={[styles.recurringRow, { marginBottom: spacing.lg }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
              {t('upcomingForm.repeatsMonthly')}
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs }}>
              {t('upcomingForm.repeatsMonthlyHint')}
            </Text>
          </View>
          <Switch value={recurring} onValueChange={setRecurring} trackColor={{ true: colors.primary }} />
        </View>

        <AccountPicker value={accountId} onChange={setAccountId} />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>{t('addTransaction.categoryLabel')}</Text>
        <View style={[styles.categoryWrap, { marginBottom: spacing.xxl }]}>
          {categories.map((option) => {
            const selected = option === category;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategory(option)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selected ? colors.primaryLight : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                  },
                ]}
              >
                <Text style={{ color: selected ? colors.primary : colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
                  {getCategoryLabel(t, option)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
            {isEditing ? t('upcomingForm.saveChanges') : t('upcomingForm.addToUpcoming')}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: colors.dangerText, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md }]}
          >
            <Text style={{ color: colors.dangerText, fontWeight: typography.weight.semibold }}>{t('upcomingForm.remove')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  typeRow: { flexDirection: 'row' },
  typeChip: { borderWidth: 1 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  recurringRow: { flexDirection: 'row', alignItems: 'center' },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderWidth: 1 },
  saveButton: { alignItems: 'center' },
  deleteButton: { alignItems: 'center', borderWidth: 1 },
});

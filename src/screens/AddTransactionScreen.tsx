import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { Transaction, TransactionCategory, TransactionType } from '../types/transaction';
import { CATEGORY_LABEL } from '../utils/categories';
import { formatDate } from '../utils/format';
import { fromDateInputValue, toDateInputValue } from '../utils/dateInput';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'other',
];
const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'transfer', 'other'];

export function AddTransactionScreen({ navigation, route }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { addTransaction, updateTransaction, getById } = useTransactions();
  const announce = useAnnounce();

  const editingId = route.params?.transactionId;
  const existing = editingId ? getById(editingId) : undefined;
  const isEditing = Boolean(existing);

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState<TransactionCategory>(existing?.category ?? 'food');
  const [dateText, setDateText] = useState(
    existing ? toDateInputValue(existing.date) : toDateInputValue(new Date().toISOString())
  );

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (next: TransactionType) => {
    setType(next);
    const nextCategories = next === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!nextCategories.includes(category)) {
      setCategory(nextCategories[0]);
    }
  };

  const handleSave = () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) {
      announce('Enter a title and a valid amount before saving');
      return;
    }
    const date = fromDateInputValue(dateText);
    if (!date) {
      announce('Enter the date as YYYY-MM-DD');
      return;
    }

    if (existing) {
      const updated: Transaction = {
        ...existing,
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
      };
      updateTransaction(updated);
      announce('Transaction updated');
    } else {
      const transaction: Transaction = {
        id: `manual-${Date.now()}`,
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
        accountName: 'Cash Wallet',
        source: 'manual',
      };
      addTransaction(transaction);
      announce(`${type === 'income' ? 'Income' : 'Expense'} added`);
    }
    navigation.goBack();
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
            marginBottom: spacing.lg,
          }}
        >
          {isEditing ? 'Edit transaction' : 'Add transaction'}
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
                  {option === 'expense' ? 'Expense' : 'Income'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          Title
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          accessibilityLabel="Title"
          placeholder="e.g. Lunch with friends"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg },
          ]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          Amount
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          accessibilityLabel="Amount"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={[
            styles.input,
            { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg },
          ]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          Date (YYYY-MM-DD)
        </Text>
        <TextInput
          value={dateText}
          onChangeText={setDateText}
          accessibilityLabel="Date"
          placeholder={toDateInputValue(new Date().toISOString())}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.xs },
          ]}
        />
        {fromDateInputValue(dateText) ? (
          <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginBottom: spacing.lg }}>
            {formatDate(fromDateInputValue(dateText)!)}
          </Text>
        ) : (
          <Text style={{ color: colors.dangerText, fontSize: typography.size.xs, marginBottom: spacing.lg }}>
            Use the format YYYY-MM-DD, e.g. {toDateInputValue(new Date().toISOString())}
          </Text>
        )}

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          Category
        </Text>
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
                  {CATEGORY_LABEL[option]}
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
            {isEditing ? 'Save changes' : `Save ${type === 'income' ? 'income' : 'expense'}`}
          </Text>
        </Pressable>
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
  typeRow: {
    flexDirection: 'row',
  },
  typeChip: {
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
  },
  saveButton: {
    alignItems: 'center',
  },
});

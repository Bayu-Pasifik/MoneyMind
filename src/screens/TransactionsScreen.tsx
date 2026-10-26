import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { SwipeableTransactionRow } from '../components/SwipeableTransactionRow';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { FilterChips, FilterOption } from '../components/FilterChips';
import { RootStackParamList } from '../navigation/types';
import { groupTransactionsByDay } from '../utils/groupTransactions';
import { Transaction } from '../types/transaction';
import { useAnnounce } from '../hooks/useAnnounce';
import { useLocale } from '../i18n/LocaleContext';

type FilterKey = 'all' | 'income' | 'expense' | 'food' | 'transport' | 'shopping' | 'auto';

export function TransactionsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t, locale } = useLocale();
  const { transactions, removeTransaction } = useTransactions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const announce = useAnnounce();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const FILTERS: FilterOption<FilterKey>[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'income', label: t('filter.income') },
    { key: 'expense', label: t('filter.expenses') },
    { key: 'food', label: t('filter.food') },
    { key: 'transport', label: t('filter.transport') },
    { key: 'shopping', label: t('filter.shopping') },
    { key: 'auto', label: t('filter.auto') },
  ];

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const matchesQuery =
        query.trim().length === 0 ||
        item.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        (item.merchant ?? '').toLowerCase().includes(query.trim().toLowerCase());

      const matchesFilter =
        filter === 'all' ||
        (filter === 'income' && item.type === 'income') ||
        (filter === 'expense' && item.type === 'expense') ||
        (filter === 'auto' && item.source === 'notification') ||
        item.category === filter;

      return matchesQuery && matchesFilter;
    });
  }, [transactions, query, filter]);

  const sections = useMemo(() => groupTransactionsByDay(filtered, t, locale), [filtered, t, locale]);

  const handlePress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handleDelete = (transaction: Transaction) => {
    removeTransaction(transaction.id);
    announce(t('transactions.deleted', { title: transaction.title }));
  };

  const handleCategorize = (transaction: Transaction) => {
    navigation.navigate('CategoryPicker', { transactionId: transaction.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xxl,
            fontWeight: typography.weight.bold,
          }}
        >
          {t('transactions.title')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('transactions.scanReceipt')}
          onPress={() => navigation.navigate('ScanReceipt')}
          style={[styles.scanButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="camera-outline" size={20} color={colors.primaryText} />
        </Pressable>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder={t('transactions.searchPlaceholder')} />
      <FilterChips options={FILTERS} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={transactions.length === 0 ? t('transactions.noneYetTitle') : t('transactions.noMatchesTitle')}
          description={
            transactions.length === 0
              ? t('transactions.noneYetDescription')
              : t('transactions.noMatchesDescription')
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingVertical: spacing.sm }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                }}
              >
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SwipeableTransactionRow
              transaction={item}
              onPress={handlePress}
              onDelete={handleDelete}
              onCategorize={handleCategorize}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { TransactionCategory } from '../types/transaction';
import { ALL_CATEGORIES, getCategoryLabel } from '../utils/categories';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryPicker'>;

export function CategoryPickerScreen({ route, navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { getById, updateTransactionCategory } = useTransactions();
  const announce = useAnnounce();
  const transaction = getById(route.params.transactionId);

  const handleSelect = (category: TransactionCategory) => {
    updateTransactionCategory(route.params.transactionId, category);
    announce(t('categoryPicker.taggedAs', { category: getCategoryLabel(t, category) }));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <View style={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}
        >
          {t('categoryPicker.title')}
        </Text>
        {transaction ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
            {transaction.title}
          </Text>
        ) : null}

        <View style={styles.grid}>
          {ALL_CATEGORIES.map((category) => (
            <Pressable
              key={category}
              accessibilityRole="button"
              accessibilityLabel={getCategoryLabel(t, category)}
              onPress={() => handleSelect(category)}
              style={[
                styles.item,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight, borderRadius: radii.pill, marginBottom: spacing.xs }]}>
                <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
                {getCategoryLabel(t, category)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

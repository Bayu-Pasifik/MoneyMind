import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { UpcomingTransaction } from '../types/upcoming';
import { isDueSoon } from '../utils/upcoming';
import { formatCurrency, formatDate } from '../utils/format';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  items: UpcomingTransaction[];
  onAdd: () => void;
  onPressItem: (item: UpcomingTransaction) => void;
  onMarkPaid: (item: UpcomingTransaction) => void;
};

export function UpcomingList({ items, onAdd, onPressItem, onMarkPaid }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t, locale } = useLocale();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
          {t('upcoming.title')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('upcoming.add')}
          hitSlop={8}
          onPress={onAdd}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Pressable
          onPress={onAdd}
          style={[styles.emptyRow, { marginTop: spacing.md }]}
          accessibilityRole="button"
          accessibilityLabel={t('upcoming.empty')}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginLeft: spacing.sm }}>
            {t('upcoming.empty')}
          </Text>
        </Pressable>
      ) : (
        items.map((item, index) => {
          const dueSoon = isDueSoon(item.dueDate);
          return (
            <Pressable
              key={item.id}
              onPress={() => onPressItem(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${formatDate(item.dueDate, locale)}, ${formatCurrency(item.amount)}`}
              style={[
                styles.row,
                { paddingVertical: spacing.sm, borderBottomColor: colors.border, borderBottomWidth: index === items.length - 1 ? 0 : 1 },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('upcoming.markPaid', { title: item.title })}
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  onMarkPaid(item);
                }}
                style={[
                  styles.checkCircle,
                  { borderColor: dueSoon ? colors.warning : colors.border, borderRadius: radii.pill, marginRight: spacing.sm },
                ]}
              />
              <View style={styles.info}>
                <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
                  {item.title}
                </Text>
                <Text style={{ color: dueSoon ? colors.warningText : colors.textTertiary, fontSize: typography.size.xs }}>
                  {dueSoon ? t('upcoming.dueSoon') : t('upcoming.due')}
                  {formatDate(item.dueDate, locale)}
                  {item.recurring ? t('upcoming.repeatsMonthly') : ''}
                </Text>
              </View>
              <Text
                style={{
                  color: item.type === 'income' ? colors.successText : colors.textPrimary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.bold,
                }}
              >
                {item.type === 'income' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  info: {
    flex: 1,
  },
});

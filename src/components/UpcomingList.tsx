import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { UpcomingTransaction } from '../types/upcoming';
import { isDueSoon } from '../utils/upcoming';
import { formatCurrency, formatDate } from '../utils/format';

type Props = {
  items: UpcomingTransaction[];
};

export function UpcomingList({ items }: Props) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: radii.card, borderColor: colors.border, padding: spacing.lg },
      ]}
    >
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold, marginBottom: spacing.sm }}>
        Upcoming
      </Text>
      {items.map((item, index) => {
        const dueSoon = isDueSoon(item.dueDate);
        return (
          <View
            key={item.id}
            style={[
              styles.row,
              { paddingVertical: spacing.sm, borderBottomColor: colors.border, borderBottomWidth: index === items.length - 1 ? 0 : 1 },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: dueSoon ? colors.warning : colors.textTertiary, borderRadius: radii.pill, marginRight: spacing.sm },
              ]}
            />
            <View style={styles.info}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
                {item.title}
              </Text>
              <Text style={{ color: dueSoon ? colors.warningText : colors.textTertiary, fontSize: typography.size.xs }}>
                {dueSoon ? 'Due soon · ' : 'Due '}
                {formatDate(item.dueDate)}
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
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
  },
  info: {
    flex: 1,
  },
});

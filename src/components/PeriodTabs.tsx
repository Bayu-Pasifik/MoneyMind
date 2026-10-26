import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Period, getPeriodLabel } from '../utils/period';
import { useLocale } from '../i18n/LocaleContext';

const PERIODS: Period[] = ['week', 'month', '3months', 'year'];

type Props = {
  value: Period;
  onChange: (period: Period) => void;
};

export function PeriodTabs({ value, onChange }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, padding: 3 },
      ]}
    >
      {PERIODS.map((period) => {
        const selected = period === value;
        return (
          <Pressable
            key={period}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(period)}
            style={[
              styles.tab,
              {
                backgroundColor: selected ? colors.surface : 'transparent',
                borderRadius: radii.pill,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <Text
              style={{
                color: selected ? colors.primary : colors.textSecondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
              }}
            >
              {getPeriodLabel(t, period)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
});

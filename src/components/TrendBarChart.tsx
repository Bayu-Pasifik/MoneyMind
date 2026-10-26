import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { DayTotal } from '../utils/analytics';
import { formatCurrency } from '../utils/format';

type Props = {
  data: DayTotal[];
};

export function TrendBarChart({ data }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const max = Math.max(...data.map((day) => day.total), 1);
  const summary = data.map((day) => `${day.label} ${formatCurrency(day.total)}`).join(', ');

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Spending trend: ${summary}`}
    >
      {data.map((day, index) => {
        const heightRatio = day.total / max;
        return (
          <View key={index} style={styles.column}>
            <View style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radii.sm }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(heightRatio * 100, day.total > 0 ? 6 : 0)}%`,
                    backgroundColor: colors.primary,
                    borderRadius: radii.sm,
                  },
                ]}
              />
            </View>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginTop: spacing.xs }}>
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  track: {
    width: 18,
    height: 100,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  count: number;
  onPress: () => void;
};

export function NotifCaptureBanner({ count, onPress }: Props) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Auto-captured ${count} transaction${count === 1 ? '' : 's'}`}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderRadius: radii.md, padding: spacing.sm },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary, borderRadius: radii.sm, marginRight: spacing.sm }]}>
        <Ionicons name="flash" size={16} color="#FFFFFF" />
      </View>
      <View style={styles.textWrap}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.xs, fontWeight: typography.weight.bold }}>
          Auto-captured {count} transaction{count === 1 ? '' : 's'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>From your payment notifications today</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
});

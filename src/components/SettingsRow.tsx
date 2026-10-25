import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

export function SettingsRow({ icon, label, value, onPress, right }: Props) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          opacity: pressed && onPress ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginRight: spacing.md }]}
      >
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, flex: 1 }}>{label}</Text>
      {right ??
        (value ? (
          <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm }}>{value}</Text>
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        ) : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

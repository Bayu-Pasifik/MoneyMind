import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: Props) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginBottom: spacing.lg },
        ]}
      >
        <Ionicons name={icon} size={32} color={colors.textTertiary} />
      </View>
      <Text
        accessibilityRole="header"
        style={{
          color: colors.textPrimary,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.semibold,
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.size.sm,
          textAlign: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  iconWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

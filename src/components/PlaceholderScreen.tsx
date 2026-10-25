import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  title: string;
  description: string;
};

/** Stand-in for screens whose feature hasn't been built yet in the build order. */
export function PlaceholderScreen({ title, description }: Props) {
  const { colors, spacing, typography } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xxl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.sm,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.md }}>
          {description}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

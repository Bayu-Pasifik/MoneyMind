import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAnnounce } from '../hooks/useAnnounce';

/**
 * Temporary root screen for the theme-tokens feature (F10).
 * Will be replaced by RootNavigator once the app shell + navigation is built.
 */
export function ThemePreviewScreen() {
  const { colors, spacing, radii, typography, mode, toggle } = useTheme();
  const announce = useAnnounce();

  const handleToggle = () => {
    toggle();
    announce(mode === 'dark' ? 'Light theme enabled' : 'Dark theme enabled');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.lg, borderColor: colors.border }]}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.sm,
          }}
        >
          MoneyMind
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.md, marginBottom: spacing.lg }}>
          Theme tokens are wired up. Current mode: {mode}.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle theme"
          onPress={handleToggle}
          style={[styles.button, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
            Switch to {mode === 'dark' ? 'light' : 'dark'} theme
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderWidth: 1,
  },
  button: {
    alignItems: 'center',
  },
});

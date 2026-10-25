import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemePreference, useTheme } from '../theme/ThemeContext';
import { SettingsRow } from '../components/SettingsRow';
import { useAnnounce } from '../hooks/useAnnounce';

const THEME_LABEL: Record<string, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export function SettingsScreen() {
  const { colors, spacing, radii, typography, preference, setPreference } = useTheme();
  const announce = useAnnounce();

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(preference) + 1) % order.length];
    setPreference(next);
    announce(`Theme set to ${THEME_LABEL[next]}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xxl,
            fontWeight: typography.weight.bold,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
          }}
        >
          Settings
        </Text>

        <View style={[styles.profileCard, { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.xl }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary, borderRadius: radii.pill }]}>
            <Text style={{ color: colors.primaryText, fontSize: typography.size.lg, fontWeight: typography.weight.bold }}>
              M
            </Text>
          </View>
          <View style={{ marginLeft: spacing.md }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
              MoneyMind User
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm }}>
              user@moneymind.app
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
          Preferences
        </Text>
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderColor: colors.border, borderWidth: 1, marginBottom: spacing.xl }}>
          <SettingsRow icon="moon-outline" label="Theme" value={THEME_LABEL[preference]} onPress={cycleTheme} />
          <Divider />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            right={<Switch value disabled trackColor={{ true: colors.primary }} />}
          />
          <Divider />
          <SettingsRow icon="cash-outline" label="Currency" value="IDR" />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
          About
        </Text>
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderColor: colors.border, borderWidth: 1 }}>
          <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <Divider />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy policy" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Divider() {
  const { colors, spacing } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 32 + spacing.md }} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

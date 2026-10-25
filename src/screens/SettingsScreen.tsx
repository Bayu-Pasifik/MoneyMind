import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ThemePreference, useTheme } from '../theme/ThemeContext';
import { SettingsRow } from '../components/SettingsRow';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { useNotificationCapture } from '../store/NotificationCaptureContext';
import { useTelegram } from '../store/TelegramContext';

const THEME_LABEL: Record<string, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export function SettingsScreen() {
  const { colors, spacing, radii, typography, preference, setPreference } = useTheme();
  const announce = useAnnounce();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { enabled: captureEnabled, setEnabled: setCaptureEnabled } = useNotificationCapture();
  const { connected: telegramConnected, username, connect, disconnect, weeklyReport, setWeeklyReport } = useTelegram();

  const toggleCapture = (value: boolean) => {
    setCaptureEnabled(value);
    announce(value ? 'Notification capture enabled' : 'Notification capture disabled');
  };

  const toggleTelegram = (value: boolean) => {
    if (value) {
      connect();
      announce('Telegram connected');
    } else {
      disconnect();
      announce('Telegram disconnected');
    }
  };

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

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileCard, { marginHorizontal: spacing.lg, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl }]}
        >
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.pill }]}>
            <Text style={{ color: '#FFFFFF', fontSize: typography.size.lg, fontWeight: typography.weight.bold }}>
              M
            </Text>
          </View>
          <View style={{ marginLeft: spacing.md }}>
            <Text style={{ color: '#FFFFFF', fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
              MoneyMind User
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: typography.size.sm }}>
              user@moneymind.app
            </Text>
          </View>
        </LinearGradient>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
          Preferences
        </Text>
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radii.card, borderColor: colors.border, borderWidth: 1, marginBottom: spacing.xl }}>
          <SettingsRow icon="moon-outline" label="Theme" value={THEME_LABEL[preference]} onPress={cycleTheme} />
          <Divider />
          <SettingsRow
            icon="flash-outline"
            label="Notification Capture"
            right={
              <Switch
                value={captureEnabled}
                onValueChange={toggleCapture}
                trackColor={{ true: colors.primary }}
              />
            }
          />
          <Divider />
          <SettingsRow
            icon="paper-plane-outline"
            label="Telegram"
            value={telegramConnected ? `Connected · ${username}` : 'Not connected'}
            right={
              <Switch
                value={telegramConnected}
                onValueChange={toggleTelegram}
                trackColor={{ true: colors.telegram }}
              />
            }
          />
          {telegramConnected ? (
            <>
              <Divider />
              <SettingsRow
                icon="calendar-outline"
                label="Weekly AI Report"
                right={
                  <Switch
                    value={weeklyReport}
                    onValueChange={setWeeklyReport}
                    trackColor={{ true: colors.primary }}
                  />
                }
              />
            </>
          ) : null}
          <Divider />
          <SettingsRow icon="cash-outline" label="Currency" value="IDR" />
          <Divider />
          <SettingsRow
            icon="download-outline"
            label="Export transactions"
            onPress={() => navigation.navigate('ExportSheet')}
          />
        </View>

        {captureEnabled ? (
          <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              Notification Preview
            </Text>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, padding: spacing.md },
              ]}
            >
              <View style={[styles.previewIcon, { backgroundColor: colors.primaryLight, borderRadius: radii.sm }]}>
                <Ionicons name="phone-portrait-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={{ color: colors.textPrimary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
                  BCA Mobile
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }} numberOfLines={2}>
                  Debit Rp 45.000 at Coffee Bean Co. detected and logged to MoneyMind.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
          About
        </Text>
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radii.card, borderColor: colors.border, borderWidth: 1 }}>
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  previewIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

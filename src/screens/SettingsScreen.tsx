import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ThemePreference, useTheme } from '../theme/ThemeContext';
import { SettingsRow } from '../components/SettingsRow';
import { useAnnounce } from '../hooks/useAnnounce';
import { RootStackParamList } from '../navigation/types';
import { useNotificationCapture } from '../store/NotificationCaptureContext';
import { TELEGRAM_ENABLED } from '../config/features';
import { useTelegram } from '../store/TelegramContext';
import { useProfile } from '../store/ProfileContext';
import { useWeeklyReport } from '../store/WeeklyReportContext';
import { Locale, useLocale } from '../i18n/LocaleContext';

export function SettingsScreen() {
  const { colors, spacing, radii, typography, preference, setPreference } = useTheme();
  const { t, locale, setLocale } = useLocale();
  const announce = useAnnounce();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    enabled: captureEnabled,
    setEnabled: setCaptureEnabled,
    permissionStatus,
    requestPermission: requestNotificationPermission,
  } = useNotificationCapture();
  const { connected: telegramConnected, username, connect, disconnect } = useTelegram();
  const { enabled: weeklyReportEnabled, setEnabled: setWeeklyReportEnabled } = useWeeklyReport();
  const { profile } = useProfile();
  const displayName = profile.name || t('settings.profileNameEmpty');
  const displayEmail = profile.email || (profile.name ? '' : t('settings.profileEmailEmpty'));
  const avatarInitial = (profile.name.trim().charAt(0) || '?').toUpperCase();

  const THEME_LABEL: Record<ThemePreference, string> = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
  };

  const LANGUAGE_LABEL: Record<Locale, string> = {
    en: t('settings.languageEnglish'),
    id: t('settings.languageIndonesian'),
  };

  const PERMISSION_LABEL: Record<string, string> = {
    authorized: t('settings.permission.authorized'),
    denied: t('settings.permission.denied'),
    unknown: t('settings.permission.unknown'),
    unsupported: t('settings.permission.unsupported'),
  };

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

  const cycleLanguage = () => {
    const order: Locale[] = ['en', 'id'];
    const next = order[(order.indexOf(locale) + 1) % order.length];
    setLocale(next);
    announce(`Language set to ${LANGUAGE_LABEL[next]}`);
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
          {t('settings.title')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.editProfile')}
          onPress={() => navigation.navigate('EditProfile')}
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl }}
        >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileCard, { borderRadius: radii.xl, padding: spacing.lg }]}
        >
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.pill }]}>
            <Text style={{ color: '#FFFFFF', fontSize: typography.size.lg, fontWeight: typography.weight.bold }}>
              {avatarInitial}
            </Text>
          </View>
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
              {displayName}
            </Text>
            {displayEmail ? (
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: typography.size.sm }} numberOfLines={1}>
                {displayEmail}
              </Text>
            ) : null}
          </View>
          <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.85)" />
        </LinearGradient>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
          {t('settings.sectionPreferences')}
        </Text>
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radii.card, borderColor: colors.border, borderWidth: 1, marginBottom: spacing.xl }}>
          <SettingsRow icon="language-outline" label={t('settings.language')} value={LANGUAGE_LABEL[locale]} onPress={cycleLanguage} />
          <Divider />
          <SettingsRow icon="moon-outline" label={t('settings.theme')} value={THEME_LABEL[preference]} onPress={cycleTheme} />
          <Divider />
          <SettingsRow
            icon="flash-outline"
            label={t('settings.notificationCapture')}
            value={PERMISSION_LABEL[permissionStatus]}
            onPress={permissionStatus === 'unsupported' ? undefined : requestNotificationPermission}
            right={
              <Switch
                value={captureEnabled}
                onValueChange={toggleCapture}
                disabled={permissionStatus === 'unsupported'}
                trackColor={{ true: colors.primary }}
              />
            }
          />
          {TELEGRAM_ENABLED ? (
            <>
              <Divider />
              <SettingsRow
                icon="paper-plane-outline"
                label={t('settings.telegram')}
                value={telegramConnected ? t('settings.telegramConnected', { username }) : t('settings.telegramNotConnected')}
                right={
                  <Switch
                    value={telegramConnected}
                    onValueChange={toggleTelegram}
                    trackColor={{ true: colors.telegram }}
                  />
                }
              />
            </>
          ) : null}
          <Divider />
          <SettingsRow
            icon="calendar-outline"
            label={t('settings.weeklyReport')}
            value={t('settings.weeklyReportSubtitle')}
            right={
              <Switch
                value={weeklyReportEnabled}
                onValueChange={(value) => {
                  setWeeklyReportEnabled(value);
                  announce(value ? 'Weekly report enabled' : 'Weekly report disabled');
                }}
                trackColor={{ true: colors.primary }}
              />
            }
          />
          <Divider />
          <SettingsRow icon="cash-outline" label={t('settings.currency')} value="IDR" />
          <Divider />
          <SettingsRow
            icon="pie-chart-outline"
            label={t('settings.budgetLimits')}
            onPress={() => navigation.navigate('BudgetSettings')}
          />
          <Divider />
          <SettingsRow
            icon="download-outline"
            label={t('settings.exportTransactions')}
            onPress={() => navigation.navigate('ExportSheet')}
          />
        </View>

        {captureEnabled ? (
          <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              {t('settings.notificationPreview')}
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
                  {t('settings.notificationPreviewApp')}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }} numberOfLines={2}>
                  {t('settings.notificationPreviewBody')}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
          {t('settings.sectionAbout')}
        </Text>
        <View style={{ backgroundColor: colors.surface, marginHorizontal: spacing.lg, borderRadius: radii.card, borderColor: colors.border, borderWidth: 1 }}>
          <SettingsRow icon="information-circle-outline" label={t('settings.version')} value="1.0.0" />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            label={t('settings.privacyPolicy')}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
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

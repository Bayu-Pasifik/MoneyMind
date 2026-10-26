import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { TranslationKey, useLocale } from '../i18n/LocaleContext';

type Section = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

const SECTIONS: Section[] = [
  { titleKey: 'privacy.dataStorage.title', bodyKey: 'privacy.dataStorage.body' },
  { titleKey: 'privacy.receiptScanning.title', bodyKey: 'privacy.receiptScanning.body' },
  { titleKey: 'privacy.notificationCapture.title', bodyKey: 'privacy.notificationCapture.body' },
  { titleKey: 'privacy.billReminders.title', bodyKey: 'privacy.billReminders.body' },
  { titleKey: 'privacy.weeklyReport.title', bodyKey: 'privacy.weeklyReport.body' },
  { titleKey: 'privacy.telegram.title', bodyKey: 'privacy.telegram.body' },
  { titleKey: 'privacy.yourControl.title', bodyKey: 'privacy.yourControl.body' },
];

export function PrivacyPolicyScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.xs,
          }}
        >
          {t('privacy.title')}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          {t('privacy.subtitle')}
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.titleKey} style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.size.md,
                fontWeight: typography.weight.semibold,
                marginBottom: spacing.xs,
              }}
            >
              {t(section.titleKey)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, lineHeight: 20 }}>
              {t(section.bodyKey)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
});

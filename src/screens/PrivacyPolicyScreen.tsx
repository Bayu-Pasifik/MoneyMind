import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

type Section = {
  title: string;
  body: string;
};

const SECTIONS: Section[] = [
  {
    title: 'Data storage',
    body: 'Your transactions, budgets, and upcoming bills are stored locally on this device in a SQLite database. MoneyMind does not upload this data to any server.',
  },
  {
    title: 'Receipt scanning',
    body: 'Photos you scan are sent to the OCR provider only to extract text from the receipt, then discarded. The extracted text is used to pre-fill a transaction you review before saving.',
  },
  {
    title: 'Notification capture',
    body: 'When enabled, MoneyMind reads bank/e-wallet notification text on this device to suggest transactions. This stays on-device and can be turned off anytime in Settings.',
  },
  {
    title: 'Telegram integration',
    body: 'The Telegram connection in this version is a local demo: no messages are sent to or received from a real Telegram bot.',
  },
  {
    title: 'Your control',
    body: 'You can edit or delete any transaction, and disable notification capture or Telegram at any time from Settings.',
  },
];

export function PrivacyPolicyScreen() {
  const { colors, spacing, radii, typography } = useTheme();

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
          Privacy policy
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          How MoneyMind handles your data.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.size.md,
                fontWeight: typography.weight.semibold,
                marginBottom: spacing.xs,
              }}
            >
              {section.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, lineHeight: 20 }}>
              {section.body}
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

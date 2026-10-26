import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  message: string;
  onPress: () => void;
  label?: string;
};

export function AiInsightCard({ message, onPress, label }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const resolvedLabel = label ?? t('insight.label');

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${resolvedLabel}: ${message}`} onPress={onPress}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderRadius: radii.card, padding: spacing.lg }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radii.md, marginRight: spacing.md }]}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>{resolvedLabel}</Text>
          <Text style={[styles.message, { fontSize: typography.size.sm }]}>{message}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  message: {
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 18,
  },
});

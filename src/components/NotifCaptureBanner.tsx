import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  count: number;
  onPress: () => void;
};

export function NotifCaptureBanner({ count, onPress }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const title = t(count === 1 ? 'notifBanner.titleOne' : 'notifBanner.titleOther', { count });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderRadius: radii.md, padding: spacing.sm },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary, borderRadius: radii.sm, marginRight: spacing.sm }]}>
        <Ionicons name="flash" size={16} color="#FFFFFF" />
      </View>
      <View style={styles.textWrap}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.xs, fontWeight: typography.weight.bold }}>
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{t('notifBanner.subtitle')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
});

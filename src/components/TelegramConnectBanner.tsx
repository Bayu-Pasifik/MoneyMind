import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTelegram } from '../store/TelegramContext';

export function TelegramConnectBanner() {
  const { colors, spacing, radii, typography } = useTheme();
  const { connected, username, botUsername, connect, disconnect } = useTelegram();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: '#E3F5FC', borderColor: '#B8E4F5', borderRadius: radii.md, padding: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.telegram, borderRadius: radii.sm, marginRight: spacing.sm }]}>
        <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
      </View>
      <View style={styles.textWrap}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.xs, fontWeight: typography.weight.bold }}>
          {connected ? `Telegram connected` : 'Connect Telegram'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
          {connected ? `${username} · ${botUsername}` : 'Chat with MoneyMind from Telegram too'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={connected ? 'Disconnect Telegram' : 'Connect Telegram'}
        onPress={connected ? disconnect : connect}
        style={[styles.button, { backgroundColor: colors.telegram, borderRadius: radii.sm, paddingHorizontal: spacing.sm }]}
      >
        <Text style={styles.buttonLabel}>{connected ? 'Disconnect' : 'Connect'}</Text>
      </Pressable>
    </View>
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
  button: {
    paddingVertical: 6,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

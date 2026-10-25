import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Role = 'user' | 'assistant' | 'telegram';

type Props = {
  text: string;
  role: Role;
};

const ROLE_LABEL: Record<Role, string> = {
  user: 'You',
  assistant: 'Assistant',
  telegram: 'Via Telegram',
};

export function ChatBubble({ text, role }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const isUser = role === 'user';
  const isTelegram = role === 'telegram';

  const backgroundColor = isUser ? colors.primary : isTelegram ? '#E3F5FC' : colors.surface;
  const borderColor = isUser ? colors.primary : isTelegram ? '#B8E4F5' : colors.border;
  const textColor = isUser ? colors.primaryText : colors.textPrimary;

  return (
    <View style={[styles.row, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View style={{ maxWidth: '80%' }}>
        {isTelegram ? (
          <View style={styles.tgLabelRow}>
            <Ionicons name="paper-plane" size={10} color={colors.telegram} />
            <Text style={[styles.tgLabel, { color: colors.telegram }]}>{ROLE_LABEL.telegram}</Text>
          </View>
        ) : null}
        <View
          accessibilityRole="text"
          accessibilityLabel={`${ROLE_LABEL[role]}: ${text}`}
          style={[
            styles.bubble,
            {
              backgroundColor,
              borderColor,
              borderRadius: radii.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <Text style={{ color: textColor, fontSize: typography.size.md }}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bubble: {
    borderWidth: 1,
  },
  tgLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
    marginLeft: 4,
  },
  tgLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});

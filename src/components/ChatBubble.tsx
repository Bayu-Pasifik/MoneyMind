import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  text: string;
  role: 'user' | 'assistant';
};

export function ChatBubble({ text, role }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const isUser = role === 'user';

  return (
    <View style={[styles.row, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View
        accessibilityRole="text"
        accessibilityLabel={`${isUser ? 'You' : 'Assistant'}: ${text}`}
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.surface,
            borderColor: isUser ? colors.primary : colors.border,
            borderRadius: radii.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: isUser ? colors.primaryText : colors.textPrimary,
            fontSize: typography.size.md,
          }}
        >
          {text}
        </Text>
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
    maxWidth: '80%',
    borderWidth: 1,
  },
});

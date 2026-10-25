import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Action = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
};

type Props = {
  actions: Action[];
};

function QuickActionButton({ action }: { action: Action }) {
  const { colors, spacing, radii, typography, shadows } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 40, bounciness: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 14 }),
    ]).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={() => {
        bounce();
        action.onPress();
      }}
      style={[
        styles.button,
        shadows.sm,
        { backgroundColor: colors.surface, borderRadius: radii.card, paddingVertical: spacing.md },
      ]}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          { backgroundColor: action.iconBg, borderRadius: radii.md, transform: [{ scale }] },
        ]}
      >
        <Ionicons name={action.icon} size={20} color={action.iconColor} />
      </Animated.View>
      <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold, marginTop: spacing.xs }}>
        {action.label}
      </Text>
    </Pressable>
  );
}

export function QuickActions({ actions }: Props) {
  const { spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.sm }]}>
      {actions.map((action) => (
        <QuickActionButton key={action.key} action={action} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

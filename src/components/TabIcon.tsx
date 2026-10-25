import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
};

export function TabIcon({ name, color, size, focused }: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!focused || reducedMotion) return;
    scale.setValue(0.8);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 14 }).start();
  }, [focused, reducedMotion, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Transaction } from '../types/transaction';
import { TransactionRow } from './TransactionRow';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onCategorize: (transaction: Transaction) => void;
};

export function SwipeableTransactionRow({ transaction, onPress, onDelete, onCategorize }: Props) {
  const { colors, spacing, radii } = useTheme();
  const reducedMotion = useReducedMotion();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);
  const collapse = useSharedValue(1);

  const collapseStyle = useAnimatedStyle(() => ({
    opacity: collapse.value,
    transform: [{ scaleY: collapse.value }],
    height: rowHeight === null ? undefined : rowHeight * collapse.value,
  }));

  const handleDelete = () => {
    swipeableRef.current?.close();
    if (reducedMotion) {
      onDelete(transaction);
      return;
    }
    collapse.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onDelete)(transaction);
    });
  };

  const renderRightActions = (progress: SharedValue<number>) => {
    const style = useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [{ scale: 0.8 + 0.2 * Math.min(progress.value, 1) }],
    }));

    return (
      <Animated.View style={[styles.actionWrap, { marginBottom: spacing.sm }, style]}>
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tag ${transaction.title}`}
            onPress={() => {
              swipeableRef.current?.close();
              onCategorize(transaction);
            }}
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary, borderTopLeftRadius: radii.md, borderBottomLeftRadius: radii.md },
            ]}
          >
            <Ionicons name="pricetag-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Tag</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${transaction.title}`}
            onPress={handleDelete}
            style={[
              styles.actionButton,
              { backgroundColor: colors.danger, borderTopRightRadius: radii.md, borderBottomRightRadius: radii.md },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Delete</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={collapseStyle}
      onLayout={(event) => {
        if (rowHeight === null) setRowHeight(event.nativeEvent.layout.height);
      }}
    >
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
        <TransactionRow transaction={transaction} onPress={onPress} />
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionWrap: {
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    height: '100%',
  },
  actionButton: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
});

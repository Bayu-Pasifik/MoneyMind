import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Transaction } from '../types/transaction';
import { TransactionRow } from './TransactionRow';

type Props = {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export function SwipeableTransactionRow({ transaction, onPress, onDelete }: Props) {
  const { colors, spacing, radii } = useTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);

  const renderRightActions = (progress: SharedValue<number>) => {
    const style = useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [{ scale: 0.8 + 0.2 * Math.min(progress.value, 1) }],
    }));

    return (
      <Animated.View style={[styles.actionWrap, { marginBottom: spacing.sm }, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${transaction.title}`}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(transaction);
          }}
          style={[
            styles.deleteButton,
            { backgroundColor: colors.danger, borderRadius: radii.md, paddingHorizontal: spacing.lg },
          ]}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteLabel}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
      <TransactionRow transaction={transaction} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionWrap: {
    justifyContent: 'center',
  },
  deleteButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  deleteLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

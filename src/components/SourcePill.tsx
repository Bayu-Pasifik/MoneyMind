import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { TransactionSource } from '../types/transaction';
import { SOURCE_ICON, SOURCE_LABEL } from '../utils/source';

type Props = {
  source: TransactionSource;
};

export function SourcePill({ source }: Props) {
  const { colors, radii } = useTheme();

  return (
    <View style={[styles.pill, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill }]}>
      <Ionicons name={SOURCE_ICON[source]} size={9} color={colors.textTertiary} />
      <Text style={[styles.label, { color: colors.textTertiary }]}>{SOURCE_LABEL[source]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
  },
});

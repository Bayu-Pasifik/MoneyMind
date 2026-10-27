import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { PIN_LENGTH } from '../store/AppLockContext';

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  error?: boolean;
};

const ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];

export function PinPad({ value, onChange, disabled, error }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLocale();

  const press = (digit: string) => {
    if (disabled || value.length >= PIN_LENGTH) return;
    onChange(value + digit);
  };
  const backspace = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const key = (label: string, onPress: () => void, a11y: string, content?: React.ReactNode) => (
    <Pressable
      key={a11y}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: pressed ? colors.surfaceAlt : colors.surface, borderColor: colors.border, opacity: disabled ? 0.4 : 1 },
      ]}
    >
      {content ?? (
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.semibold }}>{label}</Text>
      )}
    </Pressable>
  );

  return (
    <View>
      <View
        accessible
        accessibilityLabel={t('lock.pinProgress', { filled: value.length, total: PIN_LENGTH })}
        style={[styles.dots, { marginBottom: spacing.xl }]}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                borderColor: error ? colors.danger : colors.primary,
                backgroundColor: i < value.length ? (error ? colors.danger : colors.primary) : 'transparent',
              },
            ]}
          />
        ))}
      </View>
      {ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((d) => key(d, () => press(d), d))}
        </View>
      ))}
      <View style={styles.row}>
        <View style={styles.key} />
        {key('0', () => press('0'), '0')}
        {key('', backspace, t('lock.delete'), <Ionicons name="backspace-outline" size={24} color={colors.textPrimary} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 },
  key: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { PIN_LENGTH, useAppLock } from '../store/AppLockContext';
import { PinPad } from '../components/PinPad';

export function LockScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLocale();
  const { verifyPin, unlock, unlockWithDevice, biometricEnabled, biometricAvailable, lockoutSeconds } = useAppLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const tryDevice = useCallback(() => {
    unlockWithDevice();
  }, [unlockWithDevice]);

  useEffect(() => {
    if (biometricEnabled && biometricAvailable) tryDevice();
  }, [biometricEnabled, biometricAvailable, tryDevice]);

  const onChange = async (next: string) => {
    setPin(next);
    setError(false);
    if (next.length !== PIN_LENGTH) return;
    const ok = await verifyPin(next);
    if (ok) {
      unlock();
    } else {
      setError(true);
      setTimeout(() => setPin(''), 250);
    }
  };

  const message = lockoutSeconds > 0
    ? t('lock.tooMany', { seconds: lockoutSeconds })
    : error
      ? t('lock.wrongPin')
      : t('lock.enterPin');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={36} color={colors.primary} />
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginTop: spacing.md }}>
          MoneyMind
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: error || lockoutSeconds > 0 ? colors.dangerText : colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.xs, marginBottom: spacing.xl }}
        >
          {message}
        </Text>
        <PinPad value={pin} onChange={onChange} disabled={lockoutSeconds > 0} error={error} />
        <Pressable accessibilityRole="button" onPress={tryDevice} style={{ marginTop: spacing.md, padding: spacing.md }}>
          <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
            {biometricEnabled && biometricAvailable ? t('lock.useBiometrics') : t('lock.forgotPin')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

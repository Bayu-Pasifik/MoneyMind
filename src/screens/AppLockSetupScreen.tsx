import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { TranslationKey, useLocale } from '../i18n/LocaleContext';
import { PIN_LENGTH, useAppLock } from '../store/AppLockContext';
import { PinPad } from '../components/PinPad';
import { RootStackParamList } from '../navigation/types';

type Step = 'verify' | 'new' | 'confirm';

export function AppLockSetupScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { mode } = useRoute<RouteProp<RootStackParamList, 'AppLockSetup'>>().params;
  const { setPin: savePin, verifyPin, disable, lockoutSeconds } = useAppLock();

  const [step, setStep] = useState<Step>(mode === 'setup' ? 'new' : 'verify');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<TranslationKey | null>(null);

  const reset = (nextStep: Step, errKey: TranslationKey | null = null) => {
    setTimeout(() => {
      setPin('');
      setStep(nextStep);
      setError(errKey);
    }, 250);
  };

  const onChange = async (next: string) => {
    setPin(next);
    setError(null);
    if (next.length !== PIN_LENGTH) return;

    if (step === 'verify') {
      if (!(await verifyPin(next))) {
        setError('lock.wrongPin');
        reset('verify', 'lock.wrongPin');
        return;
      }
      if (mode === 'disable') {
        await disable();
        navigation.goBack();
      } else {
        reset('new');
      }
    } else if (step === 'new') {
      setFirstPin(next);
      reset('confirm');
    } else {
      if (next !== firstPin) {
        reset('new', 'lock.mismatch');
        return;
      }
      await savePin(next);
      navigation.goBack();
    }
  };

  const title: Record<Step, TranslationKey> = {
    verify: 'lock.enterCurrent',
    new: 'lock.createPin',
    confirm: 'lock.confirmPin',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <View style={styles.center}>
        <Text accessibilityRole="header" style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold }}>
          {t(title[step])}
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: error ? colors.dangerText : colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.xs, marginBottom: spacing.xl, textAlign: 'center', paddingHorizontal: spacing.xl }}
        >
          {lockoutSeconds > 0 ? t('lock.tooMany', { seconds: lockoutSeconds }) : error ? t(error) : step === 'new' ? t('lock.noRecoveryHint') : ' '}
        </Text>
        <PinPad value={pin} onChange={onChange} disabled={lockoutSeconds > 0} error={!!error} />
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md, padding: spacing.md }}>
          <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>{t('lock.cancel')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

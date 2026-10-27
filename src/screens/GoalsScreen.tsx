import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useGoals } from '../store/GoalsContext';
import { RootStackParamList } from '../navigation/types';
import { formatCurrency } from '../utils/format';
import { goalProgress } from '../utils/goals';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Goals'>;

export function GoalsScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { goals, saved } = useGoals();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{ color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}
        >
          {t('goals.title')}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
          {t('goals.subtitle')}
        </Text>

        {goals.length === 0 ? (
          <Text style={{ color: colors.textTertiary, fontSize: typography.size.sm, marginBottom: spacing.lg }}>
            {t('goals.empty')}
          </Text>
        ) : (
          goals.map((goal) => {
            const amount = saved[goal.id] ?? 0;
            const progress = goalProgress(amount, goal.targetAmount);
            return (
              <View
                key={goal.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.md },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('goals.edit', { name: goal.name })}
                  onPress={() => navigation.navigate('GoalForm', { goalId: goal.id })}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
                    {goal.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginTop: spacing.xs }}>
                    {t('goals.savedOf', { saved: formatCurrency(amount), target: formatCurrency(goal.targetAmount) })}
                  </Text>
                </Pressable>

                <View
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: Math.round(progress.ratio * 100) }}
                  style={[styles.track, { backgroundColor: colors.border, borderRadius: radii.pill, marginVertical: spacing.sm }]}
                >
                  <View
                    style={{
                      width: `${progress.ratio * 100}%`,
                      height: '100%',
                      borderRadius: radii.pill,
                      backgroundColor: progress.reached ? colors.income : colors.primary,
                    }}
                  />
                </View>

                <Text
                  style={{
                    color: progress.reached ? colors.income : colors.textSecondary,
                    fontSize: typography.size.sm,
                    fontWeight: progress.reached ? typography.weight.semibold : typography.weight.regular,
                    marginBottom: spacing.md,
                  }}
                >
                  {progress.reached ? t('goals.reached') : t('goals.remaining', { amount: formatCurrency(progress.remaining) })}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('goals.depositTo', { name: goal.name })}
                    onPress={() => navigation.navigate('GoalMove', { goalId: goal.id, mode: 'deposit' })}
                    style={[styles.actionButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.sm, marginRight: spacing.sm }]}
                  >
                    <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>{t('goals.deposit')}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('goals.withdrawFrom', { name: goal.name })}
                    onPress={() => navigation.navigate('GoalMove', { goalId: goal.id, mode: 'withdraw' })}
                    style={[styles.actionButton, { borderColor: colors.primary, borderWidth: 1, borderRadius: radii.md, padding: spacing.sm }]}
                  >
                    <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold }}>{t('goals.withdraw')}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('GoalForm')}
          style={[styles.addButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.sm }]}
        >
          <Ionicons name="add" size={18} color={colors.primaryText} />
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold, marginLeft: spacing.xs }}>
            {t('goals.add')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  card: { borderWidth: 1 },
  track: { height: 8, overflow: 'hidden' },
  actions: { flexDirection: 'row' },
  actionButton: { flex: 1, alignItems: 'center' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

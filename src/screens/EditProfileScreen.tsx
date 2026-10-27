import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { isValidEmail, useProfile } from '../store/ProfileContext';
import { RootStackParamList } from '../navigation/types';

export function EditProfileScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const announce = useAnnounce();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { profile, setProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [submitted, setSubmitted] = useState(false);

  const emailInvalid = email.trim() !== '' && !isValidEmail(email);
  const nameMissing = name.trim() === '';

  const handleSave = () => {
    setSubmitted(true);
    if (nameMissing || emailInvalid) return;
    setProfile({ name, email });
    announce(t('editProfile.savedAnnounce'));
    navigation.goBack();
  };

  const inputStyle = {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    color: colors.textPrimary,
    fontSize: typography.size.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  };
  const labelStyle = {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  };
  const errorStyle = { color: colors.expense, fontSize: typography.size.xs, marginTop: spacing.xs };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          <Text
            accessibilityRole="header"
            style={{
              color: colors.textPrimary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
              marginBottom: spacing.lg,
            }}
          >
            {t('editProfile.title')}
          </Text>

          <Text style={labelStyle}>{t('editProfile.nameLabel')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('editProfile.namePlaceholder')}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={t('editProfile.nameLabel')}
            autoCapitalize="words"
            autoComplete="name"
            maxLength={50}
            style={inputStyle}
          />
          {submitted && nameMissing ? <Text style={errorStyle}>{t('editProfile.nameRequired')}</Text> : null}

          <Text style={[labelStyle, { marginTop: spacing.lg }]}>{t('editProfile.emailLabel')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('editProfile.emailPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={t('editProfile.emailLabel')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            maxLength={100}
            style={inputStyle}
          />
          {emailInvalid ? <Text style={errorStyle}>{t('editProfile.emailInvalid')}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('editProfile.save')}
            onPress={handleSave}
            style={{
              backgroundColor: colors.primary,
              borderRadius: radii.card,
              paddingVertical: spacing.md,
              alignItems: 'center',
              marginTop: spacing.xl,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: typography.size.md, fontWeight: typography.weight.semibold }}>
              {t('editProfile.save')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('editProfile.cancel')}
            onPress={() => navigation.goBack()}
            style={{ alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.md }}>{t('editProfile.cancel')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
});

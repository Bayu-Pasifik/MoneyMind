import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'moneymind:profile';

export type Profile = {
  name: string;
  email: string;
};

type ProfileContextValue = {
  profile: Profile;
  isReady: boolean;
  setProfile: (profile: Profile) => void;
};

const EMPTY_PROFILE: Profile = { name: '', email: '' };

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

/**
 * Local-only user profile (display name + optional email). There is no
 * account system, so this lives in AsyncStorage on the device and is never
 * sent anywhere.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<Profile>;
        setProfileState({
          name: typeof parsed.name === 'string' ? parsed.name : '',
          email: typeof parsed.email === 'string' ? parsed.email : '',
        });
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  const setProfile = useCallback((next: Profile) => {
    const cleaned = { name: next.name.trim(), email: next.email.trim() };
    setProfileState(cleaned);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(cleaned)).catch(() => {});
  }, []);

  const value = useMemo(() => ({ profile, isReady, setProfile }), [profile, isReady, setProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

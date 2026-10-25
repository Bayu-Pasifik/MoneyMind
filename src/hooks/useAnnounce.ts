import { useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** Announces a message to screen readers (VoiceOver/TalkBack). */
export function useAnnounce() {
  return useCallback((message: string) => {
    if (!message) return;
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);
}

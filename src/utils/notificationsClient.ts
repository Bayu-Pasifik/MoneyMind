import { Platform } from 'react-native';

// expo-notifications dropped most functionality in Expo Go starting with
// SDK 53 — merely evaluating the module there can throw ("Cannot find
// native module ExpoTopicSubscriptionModule" etc, confirmed against this
// project's own Expo Go build). Every caller goes through getNotifications()
// so that failure is caught once and every feature built on it (upcoming
// reminders, the weekly report) degrades to a no-op instead of crashing the
// app. It only actually works in a custom dev client build.
type NotificationsModule = typeof import('expo-notifications');

// A single shared in-flight/resolved promise, so concurrent callers (the
// upcoming-reminders sync and the weekly report both run shortly after
// launch) all await the same attempt instead of racing to import and
// half-initialize the module independently.
let loadAttempt: Promise<NotificationsModule | null> | null = null;

async function loadNotifications(): Promise<NotificationsModule | null> {
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    return Notifications;
  } catch (error) {
    console.warn('[notifications] expo-notifications unavailable in this runtime', error);
    return null;
  }
}

export function getNotifications(): Promise<NotificationsModule | null> {
  if (!loadAttempt) loadAttempt = loadNotifications();
  return loadAttempt;
}

let permissionGranted: boolean | null = null;
const channelsReady = new Map<string, Promise<void>>();

export async function ensureNotificationPermission(
  Notifications: NonNullable<Awaited<ReturnType<typeof getNotifications>>>
): Promise<boolean> {
  if (permissionGranted !== null) return permissionGranted;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    permissionGranted = true;
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  permissionGranted = requested.granted;
  return permissionGranted;
}

export function ensureAndroidChannel(
  Notifications: NonNullable<Awaited<ReturnType<typeof getNotifications>>>,
  channelId: string,
  name: string
): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelsReady.has(channelId)) {
    channelsReady.set(
      channelId,
      Notifications.setNotificationChannelAsync(channelId, {
        name,
        importance: Notifications.AndroidImportance.DEFAULT,
      }).then(() => undefined)
    );
  }
  return channelsReady.get(channelId)!;
}

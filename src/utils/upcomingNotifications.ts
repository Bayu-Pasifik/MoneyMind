import { Platform } from 'react-native';
import { UpcomingTransaction } from '../types/upcoming';
import { formatCurrency } from './format';

// expo-notifications dropped most functionality in Expo Go starting with
// SDK 53 — merely evaluating the module there throws ("Cannot find native
// module ExpoTopicSubscriptionModule", from a top-level requireNativeModule
// call deep in its own topicSubscription.js). Everything in this file is a
// no-op when that happens; reminders only actually schedule in a custom dev
// client build. We can't reliably detect Expo Go ahead of time (Constants
// fields for this vary by SDK version), so the import itself is the probe.
let unavailable = false;
let handlerReady = false;
let channelReady: Promise<void> | null = null;
let permissionGranted: boolean | null = null;

async function getNotifications() {
  if (unavailable) return null;
  try {
    const Notifications = await import('expo-notifications');
    if (!handlerReady) {
      handlerReady = true;
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    }
    return Notifications;
  } catch (error) {
    unavailable = true;
    console.warn('[notifications] expo-notifications unavailable in this runtime', error);
    return null;
  }
}

function ensureAndroidChannel(Notifications: Awaited<ReturnType<typeof getNotifications>>): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync('upcoming-bills', {
      name: 'Upcoming bills & income',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).then(() => undefined);
  }
  return channelReady;
}

async function ensurePermission(Notifications: NonNullable<Awaited<ReturnType<typeof getNotifications>>>): Promise<boolean> {
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

function notificationIdFor(itemId: string): string {
  return `upcoming-${itemId}`;
}

/** Cancels any existing reminder for this item, then schedules a fresh one for its dueDate (skipped if that's already in the past, or we're in Expo Go). */
export async function scheduleUpcomingReminder(item: UpcomingTransaction): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const identifier = notificationIdFor(item.id);
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  const dueDate = new Date(item.dueDate);
  if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) return;

  const granted = await ensurePermission(Notifications);
  if (!granted) return;
  await ensureAndroidChannel(Notifications);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: item.type === 'income' ? `${item.title} expected today` : `${item.title} is due today`,
      body: formatCurrency(item.amount),
      data: { upcomingId: item.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueDate },
  });
}

export async function cancelUpcomingReminder(itemId: string): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(notificationIdFor(itemId)).catch(() => {});
}

/** Reconciles reminders for every current item — called after the list loads so reminders survive app restarts and permission being granted late. */
export async function syncUpcomingReminders(items: UpcomingTransaction[]): Promise<void> {
  for (const item of items) {
    await scheduleUpcomingReminder(item);
  }
}

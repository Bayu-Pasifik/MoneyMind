import { UpcomingTransaction } from '../types/upcoming';
import { formatCurrency } from './format';
import { ensureAndroidChannel, ensureNotificationPermission, getNotifications } from './notificationsClient';

const CHANNEL_ID = 'upcoming-bills';

function notificationIdFor(itemId: string): string {
  return `upcoming-${itemId}`;
}

/** Cancels any existing reminder for this item, then schedules a fresh one for its dueDate (skipped if that's already in the past, or notifications are unavailable). */
export async function scheduleUpcomingReminder(item: UpcomingTransaction): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const identifier = notificationIdFor(item.id);
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  const dueDate = new Date(item.dueDate);
  if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) return;

  const granted = await ensureNotificationPermission(Notifications);
  if (!granted) return;
  await ensureAndroidChannel(Notifications, CHANNEL_ID, 'Upcoming bills & income');

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

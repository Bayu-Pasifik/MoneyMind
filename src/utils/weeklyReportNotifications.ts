import { WeeklyReport } from './insight';
import { ensureAndroidChannel, ensureNotificationPermission, getNotifications } from './notificationsClient';

const CHANNEL_ID = 'weekly-report';

export async function sendWeeklyReportNotification(report: WeeklyReport): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const granted = await ensureNotificationPermission(Notifications);
  if (!granted) return;
  await ensureAndroidChannel(Notifications, CHANNEL_ID, 'Weekly AI report');

  await Notifications.scheduleNotificationAsync({
    content: { title: report.title, body: report.summary },
    trigger: null,
  });
}

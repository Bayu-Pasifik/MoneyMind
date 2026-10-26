import { AppRegistry, DeviceEventEmitter } from 'react-native';
import { registerRootComponent } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';

import App from './App';
import { initDatabase, insertTransaction } from './src/store/database';
import { parseNotificationToTransaction } from './src/utils/notificationParser';
import { NOTIFICATION_TRANSACTION_ADDED_EVENT } from './src/utils/events';

const NOTIFICATION_CAPTURE_ENABLED_KEY = 'moneymind:notification-capture-enabled';

// Runs whenever Android posts a notification anywhere on the device, in or
// out of foreground (see RNAndroidNotificationListener.onNotificationPosted,
// which always routes through this headless task). Must resolve a Promise.
async function handleCapturedNotification({ notification }: { notification?: string }) {
  if (!notification) return;

  const enabled = await AsyncStorage.getItem(NOTIFICATION_CAPTURE_ENABLED_KEY);
  if (enabled === 'false') return;

  try {
    const parsed = JSON.parse(notification);
    const transaction = parseNotificationToTransaction(parsed);
    if (!transaction) return;

    await initDatabase();
    await insertTransaction(transaction);
    DeviceEventEmitter.emit(NOTIFICATION_TRANSACTION_ADDED_EVENT, transaction);
  } catch (error) {
    console.error('[notification-capture] failed to process notification', error);
  }
}

AppRegistry.registerHeadlessTask(RNAndroidNotificationListenerHeadlessJsName, () => handleCapturedNotification);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

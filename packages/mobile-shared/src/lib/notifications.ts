import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  if (Platform.OS === 'web') {
    return null;
  }

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get token
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function scheduleNotification(title: string, body: string) {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // Show immediately
  });
}

export async function cancelNotification(notificationId: string) {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function setNotificationHandler(handler: (notification: Notifications.Notification) => void) {
  if (Platform.OS === 'web') {
    return;
  }

  Notifications.setNotificationHandler(handler);
}

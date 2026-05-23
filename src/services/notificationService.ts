import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(
  hour = 16,
  minute = 0,
  childName = 'there'
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await cancelDailyReminder();

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const messages = [
    {
      title: `Hey ${childName}! 🎓`,
      body: 'Time to learn something new today! Your streak is waiting 🔥',
    },
    {
      title: `${childName}, your tutor is ready! 🤖`,
      body: 'Come learn with Learnova today and keep your streak alive! ⚡',
    },
    {
      title: 'Learning time! 📚',
      body: `Don't break your streak, ${childName}! Open Learnova and keep going 🌟`,
    },
    {
      title: `Hello ${childName}! 👋`,
      body: 'Your daily lesson is waiting. Tap to start learning now! 🚀',
    },
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
      data: { screen: 'dashboard' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders() {
  if (Platform.OS === 'web') return [];
  return Notifications.getAllScheduledNotificationsAsync();
}

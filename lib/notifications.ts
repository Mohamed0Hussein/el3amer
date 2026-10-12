import { ROUTES } from '@/constants/routes';
import { queryClient } from '@/lib/queryClient';
import { getOrderById } from '@/services/orders';
import { savePushToken } from '@/services/user';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Loaded with require so dev builds made before expo-notifications was added
// keep working (a plain import throws when the native module is missing).
let Notifications: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const getPushToken = async () => {
  if (!Notifications) return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const { data } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  return data;
};

const openOrder = async (orderId?: number) => {
  if (!orderId) return;
  const order = await getOrderById(orderId);
  router.push({ pathname: ROUTES.ORDER_DETAILS as any, params: { order: JSON.stringify(order) } });
};

// Registers this phone for order updates while someone is signed in, refreshes
// order data when an update arrives, and opens the order when one is tapped.
export const useOrderNotifications = (userId: string | number | undefined, language: string) => {
  useEffect(() => {
    if (userId == null) return;
    getPushToken()
      .then((token) => token && savePushToken(String(userId), token, language))
      .catch((e) => console.warn('Push registration failed:', e?.message));
  }, [userId, language]);

  useEffect(() => {
    if (!Notifications || userId == null) return;

    const received = Notifications.addNotificationReceivedListener((n) => {
      const orderId = n.request.content.data?.orderId;
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (orderId) queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });
    const tapped = Notifications.addNotificationResponseReceivedListener((r) => {
      openOrder(r.notification.request.content.data?.orderId as number).catch(() => {});
    });
    // App was closed and opened by tapping a notification.
    const last = Notifications.getLastNotificationResponse();
    if (last) {
      Notifications.clearLastNotificationResponse();
      openOrder(last.notification.request.content.data?.orderId as number).catch(() => {});
    }

    return () => {
      received.remove();
      tapped.remove();
    };
  }, [userId]);
};

// Stop sending this account's updates to the phone once it signs out.
export const unregisterPush = (userId: string | number, language: string) =>
  savePushToken(String(userId), null, language).catch(() => {});

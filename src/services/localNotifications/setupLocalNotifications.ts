import * as Notifications from 'expo-notifications';

import type { AppDispatch } from '~/store';
import { markChildTaskLocalNotificationDelivered } from '~/store/settings/slice';

let didConfigureHandler = false;

export function configureLocalNotificationsHandler() {
  if (didConfigureHandler) {
    return;
  }

  didConfigureHandler = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function subscribeToLocalNotificationDelivery(
  dispatch: AppDispatch,
): () => void {
  configureLocalNotificationsHandler();

  const receivedSubscription =
    Notifications.addNotificationReceivedListener(notification => {
      const identifier = notification.request.identifier;

      if (identifier) {
        dispatch(markChildTaskLocalNotificationDelivered(identifier));
      }
    });

  return () => {
    receivedSubscription.remove();
  };
}

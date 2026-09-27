import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { subscribeToLocalNotificationDelivery } from '~/services/localNotifications/setupLocalNotifications';
import type { AppDispatch } from '~/store';

export function useLocalNotificationsBootstrap() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => subscribeToLocalNotificationDelivery(dispatch), [dispatch]);
}

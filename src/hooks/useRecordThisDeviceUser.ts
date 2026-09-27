import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { recordThisDeviceUserLogin } from '~/services/localNotifications/thisDeviceUsers';
import type { AppDispatch } from '~/store';
import {
  selectCurrentUser,
  selectRequireLogin,
} from '~/store/settings/selectors';

/** Tracks which users have logged in on this device (not synced to server). */
export function useRecordThisDeviceUser() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector(selectCurrentUser);
  const requireLogin = useSelector(selectRequireLogin);

  useEffect(() => {
    if (!currentUserId || requireLogin) {
      return;
    }

    recordThisDeviceUserLogin(dispatch, currentUserId);
  }, [currentUserId, dispatch, requireLogin]);
}

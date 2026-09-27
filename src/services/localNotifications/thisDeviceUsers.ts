import type { AppDispatch } from '~/store';
import { touchThisDeviceUser } from '~/store/settings/slice';
import { getTodayDateString } from '~/utils/date';

export function recordThisDeviceUserLogin(
  dispatch: AppDispatch,
  userId: string,
) {
  if (!userId) {
    return;
  }

  dispatch(
    touchThisDeviceUser({
      id: userId,
      date: getTodayDateString(),
    }),
  );
}

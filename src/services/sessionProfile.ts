import type { AppDispatch } from '~/store/store';
import {
  clearAuthTokens,
  endProfileSession,
  setRequireLogin,
} from '~/store/settings/slice';

/** Logout type 1: drop active user; keep local family + familyId. */
export function applyProfileLogout(dispatch: AppDispatch): void {
  dispatch(endProfileSession());
}

/**
 * Logout type 1 for multidevice cloud session end (idle / JWT expiry):
 * clear tokens + active profile; keep familyId and persisted family slices.
 */
export function applyMultideviceCloudSessionEnded(
  dispatch: AppDispatch,
): void {
  dispatch(clearAuthTokens());
  dispatch(endProfileSession());
  dispatch(setRequireLogin(false));
}

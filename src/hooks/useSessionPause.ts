import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '~/store';
import { store } from '~/store/store';
import {
  selectHasAuthSession,
  selectIsMultidevice,
  selectSessionPauseCount,
} from '~/store/settings/selectors';
import {
  pauseSessionChecks,
  resumeSessionChecks,
  setRequireLogin,
} from '~/store/settings/slice';

function syncRequireLoginAfterPause() {
  const state = store.getState();
  const pauseCount = selectSessionPauseCount(state);

  if (pauseCount > 0) {
    return;
  }

  const isMultidevice = selectIsMultidevice(state);
  const hasAuthSession = selectHasAuthSession(state);

  if (isMultidevice && !hasAuthSession) {
    store.dispatch(setRequireLogin(true));
  }
}

export function useMediaSessionPause(active: boolean) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!active) {
      return;
    }

    dispatch(pauseSessionChecks());

    return () => {
      dispatch(resumeSessionChecks());
      syncRequireLoginAfterPause();
    };
  }, [active, dispatch]);
}

/** @deprecated Prefer useMediaSessionPause for modal flows */
export function useSessionPause() {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      dispatch(pauseSessionChecks());

      try {
        return await operation();
      } finally {
        dispatch(resumeSessionChecks());
        syncRequireLoginAfterPause();
      }
    },
    [dispatch],
  );
}

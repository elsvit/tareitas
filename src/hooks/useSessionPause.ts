import { useCallback, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '~/store';
import {
  pauseSessionChecks,
  resumeSessionChecks,
} from '~/store/settings/slice';

export function useMediaSessionPause(active: boolean) {
  const dispatch = useDispatch<AppDispatch>();

  useLayoutEffect(() => {
    if (!active) {
      return;
    }

    dispatch(pauseSessionChecks());

    return () => {
      dispatch(resumeSessionChecks());
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
      }
    },
    [dispatch],
  );
}

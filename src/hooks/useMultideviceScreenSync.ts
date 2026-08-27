import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectHasAuthSession,
  selectIsSessionPaused,
} from '~/store/settings/selectors';
import {
  syncFamilyMembers,
  syncRewardsData,
  syncTaskAssignments,
  syncFamilyImages,
} from '~/store/settings/slice';

export type MultideviceScreenSyncScope =
  | 'tasks'
  | 'rewards'
  | 'users';

function dispatchScopeSync(
  dispatch: ReturnType<typeof useDispatch>,
  scope: MultideviceScreenSyncScope,
) {
  dispatch(syncFamilyImages());

  if (scope === 'tasks') {
    dispatch(syncTaskAssignments());
    return;
  }

  if (scope === 'rewards') {
    dispatch(syncRewardsData());
    return;
  }

  dispatch(syncFamilyMembers());
}

export function useMultideviceScreenSync(
  scope: MultideviceScreenSyncScope,
) {
  const dispatch = useDispatch();
  const hasAuthSession = useSelector(selectHasAuthSession);
  const isSessionPaused = useSelector(selectIsSessionPaused);
  const appState = useRef(AppState.currentState);
  const isSessionPausedRef = useRef(isSessionPaused);

  isSessionPausedRef.current = isSessionPaused;

  useFocusEffect(
    useCallback(() => {
      if (!hasAuthSession) {
        return;
      }

      dispatchScopeSync(dispatch, scope);
    }, [dispatch, hasAuthSession, scope]),
  );

  useEffect(() => {
    if (!hasAuthSession) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appState.current;

      if (
        previousState !== 'active' &&
        nextState === 'active' &&
        !isSessionPausedRef.current
      ) {
        dispatchScopeSync(dispatch, scope);
      }

      appState.current = nextState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch, hasAuthSession, scope]);
}

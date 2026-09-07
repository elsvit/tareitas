import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectHasAuthSession,
  selectIsMultidevice,
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
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const isSessionPaused = useSelector(selectIsSessionPaused);
  const appState = useRef(AppState.currentState);
  const isSessionPausedRef = useRef(isSessionPaused);

  isSessionPausedRef.current = isSessionPaused;

  useFocusEffect(
    useCallback(() => {
      if (!isMultidevice || !hasAuthSession) {
        return;
      }

      dispatchScopeSync(dispatch, scope);
    }, [dispatch, hasAuthSession, isMultidevice, scope]),
  );

  useEffect(() => {
    if (!isMultidevice || !hasAuthSession) {
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
  }, [dispatch, hasAuthSession, isMultidevice, scope]);
}

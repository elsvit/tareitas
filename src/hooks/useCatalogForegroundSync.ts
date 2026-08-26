import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGlobalSearchParams,
  usePathname,
  useRouter,
  useSegments,
} from 'expo-router';

import { selectParentIds } from '~/store/parents/selectors';
import {
  selectHasAuthSession,
  selectIsMultidevice,
  selectIsSessionPaused,
  selectRequireLogin,
} from '~/store/settings/selectors';
import type { PendingReturnRoute } from '~/store/settings/types';
import {
  resumeMultideviceSession,
  setPendingReturnRoute,
  touchSessionActivity,
} from '~/store/settings/slice';

const ONBOARDING_SETUP_PATH = '/(onboarding)?setup=1';

function isOnboardingRoute(segments: string[]): boolean {
  return segments.some(segment => segment === '(onboarding)');
}

function normalizeReturnParams(
  params: Record<string, string | string[] | undefined>,
): Record<string, string> | undefined {
  const entries = Object.entries(params).flatMap(
    ([key, value]) => {
      if (value === undefined) {
        return [];
      }

      return [[key, Array.isArray(value) ? value[0] : value]];
    },
  );

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

export const useCatalogForegroundSync = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const searchParams = useGlobalSearchParams();
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const requireLogin = useSelector(selectRequireLogin);
  const isSessionPaused = useSelector(selectIsSessionPaused);
  const parentIds = useSelector(selectParentIds);
  const appState = useRef(AppState.currentState);
  const isSessionPausedRef = useRef(isSessionPaused);
  const hasRedirectedToLoginRef = useRef(false);

  isSessionPausedRef.current = isSessionPaused;

  const returnRouteParamsKey = JSON.stringify(
    normalizeReturnParams(searchParams) ?? null,
  );

  useEffect(() => {
    if (!requireLogin) {
      hasRedirectedToLoginRef.current = false;
      return;
    }

    if (
      isSessionPaused ||
      parentIds.length === 0 ||
      isOnboardingRoute(segments) ||
      hasRedirectedToLoginRef.current
    ) {
      return;
    }

    hasRedirectedToLoginRef.current = true;

    const returnRoute: PendingReturnRoute = {
      pathname,
      params: normalizeReturnParams(searchParams),
    };

    dispatch(setPendingReturnRoute(returnRoute));
    router.replace(ONBOARDING_SETUP_PATH);
  }, [
    dispatch,
    parentIds.length,
    pathname,
    requireLogin,
    returnRouteParamsKey,
    router,
    searchParams,
    segments,
    isSessionPaused,
  ]);

  useEffect(() => {
    if (!isMultidevice || !hasAuthSession) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appState.current;

      if (nextState === 'background') {
        dispatch(touchSessionActivity());
      }

      if (
        previousState === 'background' &&
        nextState === 'active' &&
        !isSessionPausedRef.current
      ) {
        dispatch(resumeMultideviceSession());
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
  }, [dispatch, hasAuthSession, isMultidevice]);
};

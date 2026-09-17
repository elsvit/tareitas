import React, { useEffect, useRef } from 'react';
import 'react-native-get-random-values';

import { useRouter, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import {
  selectOnboardingIntroCompleted,
  selectPendingOnboardingChildUserId,
  selectSyncMode,
} from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { resolveAppBootRoute } from '~/utils/navigation/resolveAppBootRoute';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const hasBootRouted = useRef(false);
  const parentIds = useSelector(selectParentIds);
  const syncMode = useSelector(selectSyncMode);
  const onboardingIntroCompleted = useSelector(selectOnboardingIntroCompleted);
  const pendingOnboardingChildUserId = useSelector(
    selectPendingOnboardingChildUserId,
  );

  useEffect(() => {
    if (!navigationState?.key || hasBootRouted.current) {
      return;
    }

    hasBootRouted.current = true;

    const href = resolveAppBootRoute({
      syncMode,
      hasFamily: parentIds.length > 0,
      onboardingIntroCompleted,
      pendingOnboardingChildUserId,
    });

    router.replace(href);
  }, [
    navigationState?.key,
    onboardingIntroCompleted,
    parentIds.length,
    pendingOnboardingChildUserId,
    router,
    syncMode,
  ]);

  return <View style={{ flex: 1, backgroundColor: Colors.blue400 }} />;
}

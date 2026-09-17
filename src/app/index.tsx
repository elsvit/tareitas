import React, { useEffect } from 'react';
import 'react-native-get-random-values';

import { useRouter, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import {
  selectOnboardingIntroCompleted,
  selectShouldResumeOnboardingChildProfile,
  selectSyncMode,
} from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { resolveAppBootRoute } from '~/utils/navigation/resolveAppBootRoute';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const parentIds = useSelector(selectParentIds);
  const syncMode = useSelector(selectSyncMode);
  const onboardingIntroCompleted = useSelector(selectOnboardingIntroCompleted);
  const resumeOnboardingChildProfile = useSelector(
    selectShouldResumeOnboardingChildProfile,
  );

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    const href = resolveAppBootRoute({
      syncMode,
      hasFamily: parentIds.length > 0,
      onboardingIntroCompleted,
      resumeOnboardingChildProfile,
    });

    router.replace(href);
  }, [
    navigationState?.key,
    onboardingIntroCompleted,
    parentIds.length,
    resumeOnboardingChildProfile,
    router,
    syncMode,
  ]);

  return <View style={{ flex: 1, backgroundColor: Colors.blue400 }} />;
}

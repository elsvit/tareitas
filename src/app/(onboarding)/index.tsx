import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { OnboardingFlow } from '~/components/onboarding';
import { selectParentIds } from '~/store/parents/selectors';
import {
  selectPendingFamilySetup,
  selectRequireLogin,
} from '~/store/settings/selectors';

export default function OnboardingScreen() {
  const parentIds = useSelector(selectParentIds);
  const requireLogin = useSelector(selectRequireLogin);
  const pendingFamilySetup = useSelector(selectPendingFamilySetup);
  const { setup } = useLocalSearchParams<{ setup?: string }>();

  if (parentIds.length > 0) {
    return <Redirect href="/(tabs)/Tasks" />;
  }

  const skipIntro =
    requireLogin || pendingFamilySetup || setup === '1';

  return <OnboardingFlow skipIntro={skipIntro} />;
}

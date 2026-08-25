import { Redirect } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { OnboardingFlow } from '~/components/onboarding';
import { selectParentIds } from '~/store/parents/selectors';
import { selectRequireLogin } from '~/store/settings/selectors';

export default function OnboardingScreen() {
  const parentIds = useSelector(selectParentIds);
  const requireLogin = useSelector(selectRequireLogin);

  if (parentIds.length > 0 && !requireLogin) {
    return <Redirect href="/(tabs)/Tasks" />;
  }

  return <OnboardingFlow />;
}

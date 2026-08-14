import { Redirect } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { OnboardingFlow } from '~/components/onboarding';
import { selectParentIds } from '~/store/parents/selectors';

export default function OnboardingScreen() {
  const parentIds = useSelector(selectParentIds);

  if (parentIds.length > 0) {
    return <Redirect href="/(tabs)/Tasks" />;
  }

  return <OnboardingFlow />;
}

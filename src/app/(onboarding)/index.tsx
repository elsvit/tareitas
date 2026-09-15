import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { OnboardingFlow } from '~/components/onboarding';
import { selectParentIds } from '~/store/parents/selectors';
import { selectCurrentUser } from '~/store/settings/selectors';

export default function OnboardingScreen() {
  const parentIds = useSelector(selectParentIds);
  const currentUser = useSelector(selectCurrentUser);
  const { setup } = useLocalSearchParams<{ setup?: string }>();

  // Only skip onboarding when a user is already logged in (e.g. stray navigation).
  // Loading a device-only family for connect must keep the avatar + PIN step.
  if (parentIds.length > 0 && currentUser) {
    return <Redirect href="/(tabs)/Tasks" />;
  }

  const skipIntro = setup === '1';

  return <OnboardingFlow skipIntro={skipIntro} />;
}

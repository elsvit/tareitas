import React from 'react';
import 'react-native-get-random-values';

import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import { selectRequireLogin } from '~/store/settings/selectors';

export default function Index() {
  const parentIds = useSelector(selectParentIds);
  const requireLogin = useSelector(selectRequireLogin);

  if (parentIds.length === 0 || requireLogin) {
    return <Redirect href="/(onboarding)" />;
  }

  // return <Redirect href="/(onboarding)" />; // TODO remove later after testing

  return <Redirect href="/(tabs)/Tasks" />;
}

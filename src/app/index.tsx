import React from 'react';
import 'react-native-get-random-values';

import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import { selectRequireLogin } from '~/store/settings/selectors';

export default function Index() {
  const parentIds = useSelector(selectParentIds);
  const requireLogin = useSelector(selectRequireLogin);

  if (parentIds.length === 0) {
    return <Redirect href="/(onboarding)" />;
  }

  if (requireLogin) {
    return <Redirect href="/(onboarding)?setup=1" />;
  }

  return <Redirect href="/(tabs)/Tasks" />;
}

import React from 'react';
import 'react-native-get-random-values';

import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';

export default function Index() {
  const parentIds = useSelector(selectParentIds);

  if (parentIds.length === 0) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(onboarding)" />; // TODO remove later after testing

  // return <Redirect href="/(tabs)/Tasks" />;
}

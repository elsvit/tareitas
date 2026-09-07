import React, { useEffect } from 'react';
import 'react-native-get-random-values';

import { useRouter, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import { selectRequireLogin } from '~/store/settings/selectors';
import { Colors } from '~/styles';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const parentIds = useSelector(selectParentIds);
  const requireLogin = useSelector(selectRequireLogin);

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    const href =
      parentIds.length === 0
        ? '/(onboarding)'
        : requireLogin
          ? '/(onboarding)?setup=1'
          : '/(tabs)/Tasks';

    router.replace(href);
  }, [navigationState?.key, parentIds, requireLogin, router]);

  return <View style={{ flex: 1, backgroundColor: Colors.blue400 }} />;
}

import React, { useEffect } from 'react';
import 'react-native-get-random-values';

import { useRouter, useRootNavigationState } from 'expo-router';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import { selectSyncMode } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { resolveAppBootRoute } from '~/utils/navigation/resolveAppBootRoute';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const parentIds = useSelector(selectParentIds);
  const syncMode = useSelector(selectSyncMode);

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    const href = resolveAppBootRoute({
      syncMode,
      hasFamily: parentIds.length > 0,
    });

    router.replace(href);
  }, [navigationState?.key, parentIds.length, router, syncMode]);

  return <View style={{ flex: 1, backgroundColor: Colors.blue400 }} />;
}

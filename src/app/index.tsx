import React from 'react';
import 'react-native-get-random-values';

import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import { selectRequireLogin } from '~/store/settings/selectors';
import { Colors } from '~/styles';

export default function Index() {
  const parentIds = useSelector(selectParentIds);
  const requireLogin = useSelector(selectRequireLogin);

  const href =
    parentIds.length === 0
      ? '/(onboarding)'
      : requireLogin
        ? '/(onboarding)?setup=1'
        : '/(tabs)/Tasks';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.blue400 }}>
      <Redirect href={href} />
    </View>
  );
}

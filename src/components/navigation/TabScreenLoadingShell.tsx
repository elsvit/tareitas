import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import LogoIcon from '~/assets/img/logo.png';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { HEADER_HEIGHT } from '~/constants/sizes';
import { Colors } from '~/styles/colors';

type Props = {
  testID?: string;
};

export function TabScreenLoadingShell({ testID }: Props) {
  return (
    <SafeAreaBgImage includeBottomInset={false}>
      <View testID={testID} style={styles.root}>
        <View style={styles.header}>
          <Image source={LogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.blue500} />
        </View>
      </View>
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  logo: {
    width: 120,
    height: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

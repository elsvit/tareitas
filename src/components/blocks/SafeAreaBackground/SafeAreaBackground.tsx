import React from 'react';
import { Image, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';
import { ISafeAreaBackground, StatusBarContent } from './types';

export const SafeAreaBackground: React.FC<ISafeAreaBackground> = ({
  children,
  bgImg,
  bgColor,
  statusBarContent = StatusBarContent.DEFAULT,
  hasTopInsets = false,
}) => {
  return (
    <View style={[styles.wrapper, { backgroundColor: bgColor }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarContent}
      />

      {bgImg && (
        <Image
          source={bgImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      <SafeAreaView
        edges={hasTopInsets ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}
        style={styles.wrapperSafe}
      >
        {children}
      </SafeAreaView>
    </View>
  );
};

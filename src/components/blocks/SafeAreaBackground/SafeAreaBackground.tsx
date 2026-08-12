import React from 'react';
import { Image, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { ISafeAreaBackground, StatusBarContent } from './types';

export const SafeAreaBackground: React.FC<ISafeAreaBackground> = ({
  children,
  bgImg,
  bgColor,
  statusBarContent = StatusBarContent.DEFAULT,
  hasTopInsets = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { backgroundColor: bgColor }]}
      pointerEvents="box-none"
    >
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
      <View
        style={[
          styles.wrapperSafe,
          {
            paddingTop: hasTopInsets ? insets.top : 0,
            // paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

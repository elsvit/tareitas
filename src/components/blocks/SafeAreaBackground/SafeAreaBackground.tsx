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
  includeBottomInset = true,
}) => {
  const edges = hasTopInsets
    ? includeBottomInset
      ? (['top', 'bottom', 'left', 'right'] as const)
      : (['top', 'left', 'right'] as const)
    : includeBottomInset
      ? (['bottom', 'left', 'right'] as const)
      : (['left', 'right'] as const);

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

      <SafeAreaView edges={edges} style={styles.wrapperSafe}>
        {children}
      </SafeAreaView>
    </View>
  );
};

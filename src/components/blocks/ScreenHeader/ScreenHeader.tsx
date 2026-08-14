import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from "expo-router";

import { SCREEN_TEXT } from '~/constants/formField';

import { styles } from './styles';
import { IIconButton, IScreenHeader } from './types';
import ChevronLeftIcon from '~/assets/svg/common/chevron-left.svg';

export const ScreenHeader: React.FC<IScreenHeader> = ({
  title,
  hasBackButton,
  onBackPress,
  leftButton,
  rightButtons = [],
  containerStyle,
  titleStyle,
}) => {
  const router = useRouter();

  const renderButton = (
    btn: IIconButton,
    index: number,
    position: 'left' | 'right',
  ) => {
    if (btn.icon) {
      const IconComponent = btn.icon;
      return (
        <TouchableOpacity
          key={`btn-${position}-${index}`}
          style={position === 'left' ? styles.leftButton : styles.rightButton}
          onPress={btn.onPress}
        >
          <IconComponent width={24} height={24} />
        </TouchableOpacity>
      );
    } else if (btn.imageSource) {
      return (
        <TouchableOpacity
          key={`btn-${position}-${index}`}
          style={position === 'left' ? styles.leftButton : styles.rightButton}
          onPress={btn.onPress}
        >
          <Image source={btn.imageSource} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderBackButton = () => {
    if (!hasBackButton) return null;

    const handleBackPress = () => {
      if (onBackPress) {
        onBackPress();
        return;
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    };

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <ChevronLeftIcon width={24} height={24} fill={SCREEN_TEXT.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftContainer}>
        {renderBackButton()}
        {leftButton && renderButton(leftButton, 0, 'left')}
      </View>

      <View style={styles.titleContainer}>
        {title ? (
          <Text
            style={[
              styles.title,
              { color: SCREEN_TEXT.primary },
              titleStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {rightButtons
          .slice(0, 3)
          .map((btn, index) => renderButton(btn, index, 'right'))}
      </View>
    </View>
  );
};

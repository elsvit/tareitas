import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRouter } from "expo-router";

import { styles } from './styles';
import { IIconButton, IScreenHeaderWithLogo } from './types';
import ChevronLeftIcon from '~/assets/svg/common/chevron-left.svg';
import LogoIcon from '~/assets/img/logo.png';
import { useSelector } from "react-redux";
import { selectCurrentRole, selectCurrentUser } from "~/store/settings";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { IUserAvatar } from '~/types';

export const ScreenHeaderWithLogo: React.FC<IScreenHeaderWithLogo> = ({
  // title,
  hasBackButton,
  leftButton,
  rightButtons = [],
  containerStyle,
  // titleStyle,
}) => {
  const router = useRouter();

  const currentUser: IUserAvatar = useCurrentUser();

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
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    };

    return (
      <TouchableOpacity
        style={styles.leftButton}
        onPress={handleBackPress}
      >
        <ChevronLeftIcon width={24} height={24} />
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
        <Image source={LogoIcon} style={{ width: 100, height: 30 }} />
      </View>

      <View style={styles.rightContainer}>
        {rightButtons
          .slice(0, 3)
          .map((btn, index) => renderButton(btn, index, 'right'))}
      </View>
    </View>
  );
};

import { useRouter } from 'expo-router';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import LogoIcon from '~/assets/img/logo.png';
import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import ChevronLeftIcon from '~/assets/svg/common/chevron-left.svg';
import { Text } from '~/components/ui';
import { SCREEN_TEXT } from '~/constants/formField';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useUserSwitch } from '~/hooks/useUserSwitch';
import { t } from '~/services';
import { styles } from './styles';
import { IIconButton, IScreenHeaderWithLogo } from './types';

const USER_AVATAR_MAP = Object.fromEntries(
  [...PARENT_AVATARS, ...CHILDREN_AVATARS].map(({ value, image }) => [
    value,
    image,
  ]),
);

export const ScreenHeaderWithLogo: React.FC<IScreenHeaderWithLogo> = ({
  hasBackButton,
  leftButton,
  rightButtons = [],
  containerStyle,
}) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { openSelectUsers, modals } = useUserSwitch();

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
    }

    if (btn.imageSource) {
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
    if (!hasBackButton) {
      return null;
    }

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
        <ChevronLeftIcon width={24} height={24} fill={SCREEN_TEXT.primary} />
      </TouchableOpacity>
    );
  };

  const renderUserSwitch = () => {
    const handlePress = openSelectUsers;
    const displayName = currentUser?.name ?? t('users.login');

    const renderAvatar = () => {
      if (!currentUser) {
        return (
          <View style={styles.avatarButton}>
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>?</Text>
            </View>
          </View>
        );
      }

      const { avatar, name, color } = currentUser;
      const isRemote = !!avatar && /^(https?:\/\/|data:)/.test(avatar);
      const avatarSource = avatar ? USER_AVATAR_MAP[avatar] : undefined;

      return (
        <View
          style={[styles.avatarButton, color ? { borderColor: color } : null]}
        >
          {avatar && isRemote ? (
            <ExpoImage source={{ uri: avatar }} style={styles.avatarImage} />
          ) : avatarSource ? (
            <ExpoImage source={avatarSource} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t('users.login')}
        onPress={handlePress}
        style={styles.userSwitch}
      >
        <Text
          variant="bodyMedium"
          fontFamily="fredoka"
          weight="medium"
          numberOfLines={1}
          style={[
            styles.userName,
            currentUser?.color ? { color: currentUser.color } : null,
          ]}
        >
          {displayName}
        </Text>
        {renderAvatar()}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <View style={styles.leftContainer}>
          {renderBackButton()}
          {leftButton && renderButton(leftButton, 0, 'left')}
        </View>

        <View style={styles.titleContainer}>
          <Image source={LogoIcon} style={{ width: 100, height: 30 }} />
        </View>

        <View style={styles.rightContainer}>
          {renderUserSwitch()}
          {rightButtons
            .slice(0, 3)
            .map((btn, index) => renderButton(btn, index, 'right'))}
        </View>
      </View>

      {modals}
    </>
  );
};

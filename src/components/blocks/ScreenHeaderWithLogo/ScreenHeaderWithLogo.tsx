import { useRouter } from 'expo-router';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import LogoIcon from '~/assets/img/logo.png';
import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import ChevronLeftIcon from '~/assets/svg/common/chevron-left.svg';
import { Text } from '~/components/ui';
import { UserAvatar } from '~/components/users/UserAvatar';
import { SCREEN_TEXT } from '~/constants/formField';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useSyncEarnedRewardPeriods } from '~/hooks/useSyncEarnedRewardPeriods';
import { useUserSwitch } from '~/hooks/useUserSwitch';
import { t } from '~/services';
import { selectUserImageUrls } from '~/store/images';
import { selectChildRewardBalance } from '~/store/rewards/selectors';
import { Colors } from '~/styles';
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
  const { user: currentUser, isChild, currentUserId } = useCurrentUser();
  const { openSelectUsers, modals } = useUserSwitch();
  const childId = isChild ? currentUserId ?? '' : '';
  const childBalance = useSelector(selectChildRewardBalance(childId));

  useSyncEarnedRewardPeriods();

  const userUrls = useSelector(selectUserImageUrls);

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
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <ChevronLeftIcon width={24} height={24} fill={SCREEN_TEXT.primary} />
      </TouchableOpacity>
    );
  };

  const renderChildRewards = () => {
    if (!isChild || !currentUser) {
      return null;
    }

    return (
      <View
        style={styles.childRewards}
        accessibilityLabel={t('rewards.current_rewards')}
      >
        <Text
          variant="titleMedium"
          fontFamily="fredoka"
          weight="bold"
          style={styles.childRewardsValue}
        >
          ⭐ {childBalance}
        </Text>
      </View>
    );
  };

  const renderUserSwitch = () => {
    const handlePress = openSelectUsers;
    const displayName = currentUser?.name ?? t('users.login');

    const renderAvatar = () => {
      if (!currentUser) {
        return (
          <UserAvatar
            name="?"
            customUrls={userUrls}
            builtInImages={USER_AVATAR_MAP}
            size={36}
            style={styles.avatarButton}
          />
        );
      }

      const { color, avatar, name } = currentUser;

      return (
        <UserAvatar
          avatar={avatar}
          name={name}
          textColor={color}
          customUrls={userUrls}
          builtInImages={USER_AVATAR_MAP}
          size={36}
          style={[
            styles.avatarButton,
            color ? { borderColor: color } : null,
          ]}
        />
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
          {renderChildRewards()}
          {renderBackButton()}
          {leftButton && renderButton(leftButton, 0, 'left')}
        </View>

        <View style={styles.titleContainer}>
          <Image source={LogoIcon} style={
            {
              width: 90,
              resizeMode: 'contain'
            }
          } />
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

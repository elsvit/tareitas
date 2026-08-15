import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';

import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { selectUserImageUrls } from '~/store/images';
import { Colors } from '~/styles';
import type { ChildFormProps } from '~/types/IChild';
import type { ParentFormProps } from '~/types/IParent';
import { resolvePictureSource } from '~/utils/pictureSource';

import { onboardingStyles as styles } from './styles';

type OnboardingCompleteProps = {
  parent?: Partial<ParentFormProps>;
  child?: ChildFormProps;
};

const USER_AVATAR_MAP = Object.fromEntries(
  [...PARENT_AVATARS, ...CHILDREN_AVATARS].map(({ value, image }) => [
    value,
    image,
  ]),
);

export function OnboardingComplete({ parent, child }: OnboardingCompleteProps) {
  const userUrls = useSelector(selectUserImageUrls);
  const bounce = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withSpring(1.06, { damping: 4 }), withSpring(1, { damping: 4 })),
      -1,
      true,
    );
  }, [bounce]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const parentAvatar = useMemo(
    () => resolvePictureSource(parent?.avatar, userUrls, USER_AVATAR_MAP),
    [parent?.avatar, userUrls],
  );

  const childAvatar = useMemo(
    () => resolvePictureSource(child?.avatar, userUrls, USER_AVATAR_MAP),
    [child?.avatar, userUrls],
  );

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.completeContainer}>
      <Animated.Text entering={ZoomIn.springify()} style={{ fontSize: 64 }}>
        🎉
      </Animated.Text>

      <Animated.View style={emojiStyle}>
        <Text
          variant="headlineSmall"
          fontFamily="fredoka"
          weight="bold"
          color={Colors.orange500}
          style={styles.completeName}
        >
          {t('onboarding.complete.title')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <Text variant="bodyLarge" style={styles.introDescription}>
          {t('onboarding.complete.description', {
            parent: parent?.name ?? t('onboarding.complete.parent_fallback'),
            child: child?.name ?? t('onboarding.complete.child_fallback'),
          })}
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(350).springify()}
        style={styles.completeAvatarsRow}
      >
        <View style={[styles.avatarCircle, { borderColor: Colors.blue500 }]}>
          {parentAvatar ? (
            <Image source={parentAvatar} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <View style={[styles.avatarImage, { backgroundColor: Colors.blue100 }]} />
          )}
        </View>
        <Text style={styles.arrowText}>→</Text>
        <View style={[styles.avatarCircle, { borderColor: Colors.brightGreen500 }]}>
          {childAvatar ? (
            <Image source={childAvatar} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <View style={[styles.avatarImage, { backgroundColor: Colors.brightGreen100 }]} />
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

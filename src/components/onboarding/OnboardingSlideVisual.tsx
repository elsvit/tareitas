import React, { useEffect } from 'react';
import { View } from 'react-native';

import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';

import makeBed from '~/assets/img/tasks/make_bed.jpg';
import packBackpack from '~/assets/img/tasks/pack_backpack.jpg';
import Girl1 from '~/assets/img/users/girl1_320.jpg';
import Man1 from '~/assets/img/users/man1_320.jpg';
import { Text } from '~/components/ui';
import { Colors } from '~/styles';

import type { OnboardingIntroSlideId } from './onboardingSlides';
import { onboardingStyles as styles } from './styles';

type OnboardingSlideVisualProps = {
  slideId: OnboardingIntroSlideId;
};

function FloatingStar({ delay, style }: { delay: number; style?: object }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(-8, { damping: 4 }),
          withSpring(0, { damping: 4 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.Text style={[styles.starBadge, style, animatedStyle]}>⭐</Animated.Text>
  );
}

function CreateTasksVisual() {
  return (
    <View style={styles.visualStage}>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={[styles.avatarCircle, { borderColor: Colors.blue500 }]}>
          <Image source={Man1} style={styles.avatarImage} contentFit="cover" />
        </View>
      </Animated.View>
      <Animated.View entering={ZoomIn.delay(300).springify()} style={{ marginTop: 16 }}>
        <View style={styles.taskCard}>
          <Image source={makeBed} style={styles.taskImage} contentFit="cover" />
        </View>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(500)} style={{ marginTop: 12 }}>
        <Text variant="labelLarge" weight="bold" color={Colors.blue600}>
          +10 ⭐
        </Text>
      </Animated.View>
    </View>
  );
}

function EarnStarsVisual() {
  return (
    <View style={styles.visualStage}>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={[styles.avatarCircle, { borderColor: Colors.brightGreen500 }]}>
          <Image source={Girl1} style={styles.avatarImage} contentFit="cover" />
        </View>
      </Animated.View>
      <Animated.View entering={ZoomIn.delay(350).springify()} style={{ marginTop: 16 }}>
        <View style={styles.taskCard}>
          <Image source={packBackpack} style={styles.taskImage} contentFit="cover" />
        </View>
      </Animated.View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <FloatingStar delay={0} />
        <FloatingStar delay={150} />
        <FloatingStar delay={300} />
      </View>
    </View>
  );
}

function SelectRewardVisual() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.08, { damping: 5 }), withSpring(1, { damping: 5 })),
      -1,
      true,
    );
  }, [scale]);

  const rewardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.visualStage}>
      <Animated.View style={rewardStyle}>
        <View style={styles.rewardCard}>
          <Text style={{ fontSize: 40 }}>🎁</Text>
          <Text variant="labelMedium" weight="bold" color={Colors.orange500}>
            -25 ⭐
          </Text>
        </View>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(400)} style={{ marginTop: 20 }}>
        <View style={styles.completeAvatarsRow}>
          <View style={[styles.avatarCircle, { width: 56, height: 56, borderRadius: 28 }]}>
            <Image source={Girl1} style={styles.avatarImage} contentFit="cover" />
          </View>
          <Text variant="titleLarge">🎉</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export function OnboardingSlideVisual({ slideId }: OnboardingSlideVisualProps) {
  switch (slideId) {
    case 'create-tasks':
      return <CreateTasksVisual />;
    case 'earn-stars':
      return <EarnStarsVisual />;
    case 'select-reward':
      return <SelectRewardVisual />;
  }
}

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '~/components/ui';

const ANIMATION_DURATION = 1100;

type StarConfig = {
  offsetX: number;
  driftX: number;
  delay: number;
  size: number;
};

const STAR_CONFIGS: StarConfig[] = [
  { offsetX: -28, driftX: -12, delay: 0, size: 18 },
  { offsetX: -12, driftX: -6, delay: 70, size: 22 },
  { offsetX: 4, driftX: 0, delay: 30, size: 26 },
  { offsetX: 18, driftX: 8, delay: 110, size: 20 },
  { offsetX: 32, driftX: 14, delay: 50, size: 16 },
];

type AnimatedStarProps = {
  config: StarConfig;
  trigger: number;
};

function AnimatedStar({ config, trigger }: AnimatedStarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      config.delay,
      withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [config.delay, progress, trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - progress.value * 1.1),
    transform: [
      { translateX: config.offsetX + config.driftX * progress.value },
      { translateY: -72 * progress.value },
      {
        scale: 0.4 + (1 - progress.value * 0.5) * (config.size / 22),
      },
      { rotate: `${progress.value * 24}deg` },
    ],
  }));

  return (
    <Animated.Text style={[styles.star, { fontSize: config.size }, animatedStyle]}>
      ⭐
    </Animated.Text>
  );
}

type TaskRewardStarsAnimationProps = {
  trigger: number;
  rewardText: string;
};

export function TaskRewardStarsAnimation({
  trigger,
  rewardText,
}: TaskRewardStarsAnimationProps) {
  const labelProgress = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0 || rewardText === '') {
      return;
    }

    labelProgress.value = 0;
    labelProgress.value = withSequence(
      withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.back(1.4)),
      }),
      withDelay(
        420,
        withTiming(0, {
          duration: 280,
          easing: Easing.in(Easing.quad),
        }),
      ),
    );
  }, [labelProgress, rewardText, trigger]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
    transform: [{ scale: 0.55 + labelProgress.value * 0.45 }],
  }));

  if (trigger === 0 || rewardText === '') {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.starsContainer}>
        {STAR_CONFIGS.map((config, index) => (
          <AnimatedStar key={index} config={config} trigger={trigger} />
        ))}
      </View>

      <Animated.View style={[styles.rewardLabel, labelStyle]}>
        <Text fontFamily="fredoka" weight="bold" style={styles.rewardText}>
          +⭐ {rewardText}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    overflow: 'visible',
  },

  starsContainer: {
    position: 'absolute',
    left: 20,
    bottom: 18,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  star: {
    position: 'absolute',
    bottom: 0,
    textShadowColor: 'rgba(245, 159, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  rewardLabel: {
    position: 'absolute',
    left: 8,
    bottom: 34,
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59F00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  rewardText: {
    color: '#F59F00',
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default TaskRewardStarsAnimation;

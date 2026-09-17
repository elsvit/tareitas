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

const ANIMATION_DURATION = 950;

type SparkleConfig = {
  offsetX: number;
  driftX: number;
  driftY: number;
  delay: number;
  size: number;
  glyph: string;
};

const SPARKLE_CONFIGS: SparkleConfig[] = [
  { offsetX: -34, driftX: -10, driftY: -64, delay: 0, size: 18, glyph: '✨' },
  { offsetX: -14, driftX: -4, driftY: -78, delay: 60, size: 22, glyph: '⭐' },
  { offsetX: 8, driftX: 2, driftY: -70, delay: 30, size: 20, glyph: '✨' },
  { offsetX: 28, driftX: 8, driftY: -62, delay: 90, size: 16, glyph: '💫' },
  { offsetX: 46, driftX: 12, driftY: -54, delay: 120, size: 14, glyph: '✨' },
];

type AnimatedSparkleProps = {
  config: SparkleConfig;
  trigger: number;
};

function AnimatedSparkle({ config, trigger }: AnimatedSparkleProps) {
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
    opacity: Math.max(0, 1 - progress.value * 1.15),
    transform: [
      { translateX: config.offsetX + config.driftX * progress.value },
      { translateY: config.driftY * progress.value },
      {
        scale:
          0.35 +
          (1 - progress.value * 0.45) * (config.size / 20),
      },
      { rotate: `${progress.value * (config.glyph === '💫' ? 40 : -28)}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[styles.sparkle, { fontSize: config.size }, animatedStyle]}
    >
      {config.glyph}
    </Animated.Text>
  );
}

type RewardSelectSparkleAnimationProps = {
  trigger: number;
};

export function RewardSelectSparkleAnimation({
  trigger,
}: RewardSelectSparkleAnimationProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    pulse.value = 0;
    pulse.value = withSequence(
      withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.back(1.5)),
      }),
      withDelay(
        500,
        withTiming(0, {
          duration: 240,
          easing: Easing.in(Easing.quad),
        }),
      ),
    );
  }, [pulse, trigger]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.35,
    transform: [{ scale: 0.85 + pulse.value * 0.25 }],
  }));

  if (trigger === 0) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.pulse, pulseStyle]} />

      <View style={styles.sparklesContainer}>
        {SPARKLE_CONFIGS.map((config, index) => (
          <AnimatedSparkle key={index} config={config} trigger={trigger} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    overflow: 'visible',
  },

  pulse: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderRadius: 16,
    backgroundColor: '#C084FC',
  },

  sparklesContainer: {
    position: 'absolute',
    left: 24,
    bottom: 16,
    width: 96,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  sparkle: {
    position: 'absolute',
    bottom: 0,
    textShadowColor: 'rgba(192, 132, 252, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});

export default RewardSelectSparkleAnimation;

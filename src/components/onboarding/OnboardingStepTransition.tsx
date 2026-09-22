import React from 'react';
import { Platform, View } from 'react-native';

import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';

import { onboardingStyles as styles } from './styles';

export type OnboardingTransitionDirection = 1 | -1;

type OnboardingStepTransitionProps = {
  stepKey: number;
  direction: OnboardingTransitionDirection;
  children: React.ReactNode;
};

function getEnteringAnimation(
  direction: OnboardingTransitionDirection,
) {
  // Slide entering animations can leave an invisible touch blocker on iOS.
  if (Platform.OS === 'ios') {
    return FadeIn.duration(200);
  }

  return direction > 0
    ? SlideInRight.duration(280)
    : SlideInLeft.duration(280);
}

export function OnboardingStepTransition({
  stepKey,
  direction,
  children,
}: OnboardingStepTransitionProps) {
  return (
    <View
      style={[
        styles.stepTransitionHost,
        Platform.OS === 'ios' && styles.stepTransitionHostIos,
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        key={stepKey}
        entering={getEnteringAnimation(direction)}
        pointerEvents="box-none"
        style={styles.stepTransitionContent}
      >
        {children}
      </Animated.View>
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';

import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';

import { onboardingStyles as styles } from './styles';

export type OnboardingTransitionDirection = 1 | -1;

type OnboardingStepTransitionProps = {
  stepKey: number;
  direction: OnboardingTransitionDirection;
  children: React.ReactNode;
};

export function OnboardingStepTransition({
  stepKey,
  direction,
  children,
}: OnboardingStepTransitionProps) {
  return (
    <View style={styles.stepTransitionHost}>
      <Animated.View
        key={stepKey}
        entering={
          direction > 0
            ? SlideInRight.duration(280)
            : SlideInLeft.duration(280)
        }
        style={styles.stepTransitionContent}
      >
        {children}
      </Animated.View>
    </View>
  );
}

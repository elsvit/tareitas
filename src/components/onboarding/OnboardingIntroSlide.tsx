import React from 'react';
import { View } from 'react-native';

import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Text } from '~/components/ui';
import { Colors } from '~/styles';

import { OnboardingSlideVisual } from './OnboardingSlideVisual';
import type { OnboardingIntroSlide } from './onboardingSlides';
import { onboardingStyles as styles } from './styles';

type OnboardingIntroSlideProps = {
  slide: OnboardingIntroSlide;
  activeIndex: number;
  totalIntroSlides: number;
};

export function OnboardingIntroSlide({
  slide,
  activeIndex,
  totalIntroSlides,
}: OnboardingIntroSlideProps) {
  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.introSlide}>
      <OnboardingSlideVisual slideId={slide.id} />

      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <Text
          variant="headlineSmall"
          fontFamily="fredoka"
          weight="bold"
          color={Colors.orange500}
          style={styles.introTitle}
        >
          {slide.title}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(320).springify()}>
        <Text variant="bodyLarge" style={styles.introDescription}>
          {slide.description}
        </Text>
      </Animated.View>

      <View style={styles.dotsRow}>
        {Array.from({ length: totalIntroSlides }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

import React from 'react';
import { View } from 'react-native';

import { Text } from '~/components/ui';
import { Colors } from '~/styles';

import { onboardingStyles as styles } from './styles';

type OnboardingStepHeaderProps = {
  title: string;
  description: string;
  stepIndicator?: string;
  accentColor?: string;
};

export function OnboardingStepHeader({
  title,
  description,
  stepIndicator,
  accentColor,
}: OnboardingStepHeaderProps) {
  return (
    <View style={styles.stepHeader}>
      {stepIndicator ? (
        <View style={styles.stepIndicatorBadge}>
          <Text
            variant="labelMedium"
            weight="bold"
            color={accentColor ?? Colors.orange500}
          >
            {stepIndicator}
          </Text>
        </View>
      ) : null}
      <Text
        variant="titleLarge"
        fontFamily="fredoka"
        weight="bold"
        color={accentColor ?? Colors.orange500}
      >
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        {description}
      </Text>
    </View>
  );
}

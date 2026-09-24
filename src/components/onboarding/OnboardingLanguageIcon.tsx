import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SvgProps } from 'react-native-svg';

import { SCREEN_TEXT } from '~/constants/formField';

export const OnboardingLanguageIcon: React.FC<SvgProps> = ({
  width = 24,
  height = 24,
  color,
}) => {
  const size =
    typeof width === 'number'
      ? width
      : typeof height === 'number'
        ? height
        : 24;

  return (
    <MaterialCommunityIcons
      name="translate"
      size={size}
      color={color ?? SCREEN_TEXT.primary}
    />
  );
};

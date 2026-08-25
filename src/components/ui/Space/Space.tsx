import React, { memo } from 'react';
import { View } from 'react-native';

export const SPACE_SIZE = 4;

const Space = memo(
  ({
    size = 1,
    horizontal = false,
  }: {
    size: number;
    horizontal?: boolean;
  }) => {
    if (horizontal) {
      return <View style={{ width: size * SPACE_SIZE }} />;
    }

    return <View style={{ height: size * SPACE_SIZE }} />;
  },
);

export { Space };

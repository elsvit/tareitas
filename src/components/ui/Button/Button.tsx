import React from 'react';
import type { ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { BUTTON_HEIGHT } from '~/constants/sizes';
import { Colors } from '~/styles/colors';

export type PaperButtonProps = ComponentProps<typeof PaperButton>;

// export type ButtonBgColor = 'green' | 'brown' | 'orange' | 'violet' | 'red';

export type ButtonProps = PaperButtonProps & {
  isFullSize?: boolean;
  bgColor?: ButtonColors;
};

export enum ButtonColors {
  Green = 'Green',
  Brown = 'Brown',
  Orange = 'Orange',
  Violet = 'Violet',
  Red = 'Red',
  Gray = 'Gray',
}

export const COLOR_MAP: Record<ButtonColors, string> = {
  [ButtonColors.Green]: '#4CAF50',
  [ButtonColors.Brown]: '#6d4c41',
  [ButtonColors.Orange]: '#fb8c00',
  [ButtonColors.Violet]: '#7e57c2',
  [ButtonColors.Red]: '#e53935',
  [ButtonColors.Gray]: '#9e9e9e',
};

export const Button = React.forwardRef<React.ComponentRef<typeof PaperButton>, ButtonProps>(
  function Button(
    {
      isFullSize = false,
      bgColor = ButtonColors.Green,
      style,
      contentStyle,
      buttonColor,
      mode = 'contained',
      textColor,
      labelStyle,
      ...rest
    },
    ref,
  ) {
    const resolvedButtonColor =
      buttonColor ?? (bgColor ? COLOR_MAP[bgColor] : undefined);

    const resolvedTextColor =
      textColor ??
      (mode === 'contained' && resolvedButtonColor ? Colors.white : undefined);

    const resolvedLabelStyle =
      mode === 'contained' && resolvedButtonColor && !textColor
        ? [styles.containedLabel, labelStyle]
        : labelStyle;

    const paperButtonProps = {
      ...rest,
      mode,
      buttonColor: resolvedButtonColor,
      textColor: resolvedTextColor,
      labelStyle: resolvedLabelStyle,
      style: [styles.baseRadius, !isFullSize && styles.minWidth, style as any],
      contentStyle: [styles.fixedHeight, contentStyle as any],
    };

    if (isFullSize) {
      return (
        <View style={styles.fullWidthWrapper}>
          <PaperButton ref={ref} {...paperButtonProps} />
        </View>
      );
    }

    return <PaperButton ref={ref} {...paperButtonProps} />;
  },
);

const styles = StyleSheet.create({
  baseRadius: {
    borderRadius: 12,
  },
  fullWidthWrapper: {
    width: '100%',
  },
  minWidth: {
    minWidth: 120,
  },
  fixedHeight: {
    height: BUTTON_HEIGHT,
  },
  containedLabel: {
    color: Colors.white,
  },
});

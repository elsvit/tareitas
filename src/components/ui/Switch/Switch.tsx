import React from 'react';
import type { ComponentProps } from 'react';

import { Switch as PaperSwitch } from 'react-native-paper';

import { Colors } from '~/styles/colors';
import { useAppTheme } from '~/styles/paperTheme';

export type PaperSwitchProps = ComponentProps<typeof PaperSwitch>;

const SWITCH_TRACK_OFF = Colors.grey300;

export const Switch: React.FC<PaperSwitchProps> = ({
  trackColor,
  thumbColor,
  ios_backgroundColor,
  children,
  ...rest
}) => {
  const theme = useAppTheme();

  return (
    <PaperSwitch
      trackColor={
        trackColor ?? {
          false: SWITCH_TRACK_OFF,
          true: theme.colors.primary,
        }
      }
      thumbColor={thumbColor ?? Colors.white}
      ios_backgroundColor={ios_backgroundColor ?? SWITCH_TRACK_OFF}
      {...rest}
    >
      {children}
    </PaperSwitch>
  );
};

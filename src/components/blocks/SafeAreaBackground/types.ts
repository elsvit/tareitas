import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

export enum StatusBarContent {
  LIGHT = 'light-content',
  DARK = 'dark-content',
  DEFAULT = 'default',
}

export interface ISafeAreaBackground {
  bgImg?: ImageSourcePropType;
  bgColor?: string;
  children?: ReactNode;
  statusBarContent?: StatusBarContent;
  hasTopInsets?: boolean;
}

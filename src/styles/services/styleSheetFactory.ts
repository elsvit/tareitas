import { useColorScheme } from 'react-native';

import { darkPalette, lightPalette } from '../palette';

import { registerThemes } from './registerThemes';

const getAppearance = (): 'light' | 'dark' => useColorScheme() ?? 'light';

export const styleSheetFactory = registerThemes(
  { light: lightPalette, dark: darkPalette },
  getAppearance,
);

export const SPACING = 4;

export const spacing = (size = 1) => SPACING * size;

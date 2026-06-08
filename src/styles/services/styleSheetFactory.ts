import { darkPalette, lightPalette } from '~/styles';

import { registerThemes } from '~/styles/services';

const useColorScheme = (): 'light' | 'dark' => 'light';

export const styleSheetFactory = registerThemes(
  { light: lightPalette, dark: darkPalette },
  useColorScheme,
);

export const SPACING = 4;

export const spacing = (size = 1) => SPACING * size;

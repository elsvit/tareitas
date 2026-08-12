import { Colors } from '~/styles/colors';

/** Always light appearance for inputs and selectors, regardless of app theme. */
export const FORM_FIELD = {
  background: Colors.white,
  text: Colors.grey900,
  label: Colors.grey700,
  border: '#9E9E9E',
  borderActive: Colors.grey700,
  menuBackground: Colors.white,
  menuText: Colors.grey900,
} as const;

export const FORM_FIELD_PAPER_THEME = {
  colors: {
    onSurfaceVariant: FORM_FIELD.label,
    primary: FORM_FIELD.label,
    onSurface: FORM_FIELD.text,
    surface: FORM_FIELD.background,
    background: FORM_FIELD.background,
  },
} as const;

export const FORM_FIELD_MENU_THEME = {
  colors: {
    onSurface: FORM_FIELD.menuText,
    surface: FORM_FIELD.menuBackground,
  },
} as const;

/** Screen titles and list text on background-image screens — always dark. */
export const SCREEN_TEXT = {
  primary: FORM_FIELD.text,
  secondary: FORM_FIELD.label,
} as const;

/** Form screens (Add Parent, Add Child, etc.) — always light surface. */
export const FORM_SCREEN = {
  background: 'transparent',
  // background: Colors.grey50,
  surface: FORM_FIELD.background,
  text: FORM_FIELD.text,
} as const;

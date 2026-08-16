import { SCREEN_TEXT } from '~/constants/formField';
import { spacing, styleSheetFactory } from '~/styles';
import { Colors } from '~/styles/colors';

export const SETTINGS_LIST_THEME = {
  colors: {
    background: 'transparent',
    surface: 'transparent',
    onSurface: Colors.black,
  },
} as const;

export const settingsSectionStyles = styleSheetFactory(() => ({
  section: {
    backgroundColor: 'transparent',
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  item: {
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: spacing(4),
    backgroundColor: 'transparent',
  },
  accordionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  itemTitle: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: Colors.black,
  },
  itemTitleSelected: {
    fontWeight: '700',
    color: SCREEN_TEXT.primary,
  },
  itemTitleUnselected: {
    fontWeight: '500',
    color: SCREEN_TEXT.secondary,
  },
  checkboxStyle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
}));

export default settingsSectionStyles;

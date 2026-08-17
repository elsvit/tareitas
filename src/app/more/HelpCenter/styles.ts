import { SCREEN_TEXT } from '~/constants/formField';
import { spacing, styleSheetFactory } from '~/styles';
import { Colors } from '~/styles/colors';

export const HELP_CENTER_LIST_THEME = {
  colors: {
    background: 'transparent',
    surface: 'transparent',
    onSurface: Colors.black,
  },
} as const;

export const themedStyles = styleSheetFactory(() => ({
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing(4),
  },
  section: {
    backgroundColor: 'transparent',
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  accordionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  flowContent: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(3),
    gap: spacing(2),
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  flowStepNumber: {
    width: 24,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: SCREEN_TEXT.primary,
  },
  flowStepText: {
    flex: 1,
    minWidth: 120,
    fontSize: 16,
    lineHeight: 22,
    color: SCREEN_TEXT.primary,
  },
  writeUsContent: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(3),
  },
  emailLink: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#016FE8',
    textDecorationLine: 'underline',
  },
  writeUsHint: {
    marginTop: spacing(1),
    fontSize: 14,
    lineHeight: 20,
    color: SCREEN_TEXT.secondary,
  },
}));

export default themedStyles;

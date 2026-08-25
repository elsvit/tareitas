import { spacing, styleSheetFactory } from '~/styles';

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
  subtitle: {
    marginBottom: spacing(3),
  },
}));

export default themedStyles;

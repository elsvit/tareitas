import { spacing, styleSheetFactory } from '~/styles';

export const themedStyles = styleSheetFactory(palette => ({
  headerContainer: {
    backgroundColor: palette.background.primary,
  },
  listSubheader: {
    fontSize: 20,
    fontWeight: '700',
  },
  item: {
    height: 40,
    paddingHorizontal: spacing(4),
    backgroundColor: 'transparent',
  },
  checkboxStyle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  titleStyle: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontWeight: '700',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: spacing(4),
  },
}));

export default themedStyles;

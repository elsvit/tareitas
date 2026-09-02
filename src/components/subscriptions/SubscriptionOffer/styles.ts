import { styleSheetFactory, spacing } from '~/styles';

const themedStyles = styleSheetFactory(palette => ({
  container: {
    gap: spacing(3),
  },
  title: {
    textAlign: 'center',
    color: palette.text.primary,
  },
  message: {
    textAlign: 'center',
    color: palette.text.secondary,
    lineHeight: 22,
  },
  price: {
    textAlign: 'center',
    color: palette.text.primary,
  },
  loader: {
    marginVertical: spacing(2),
  },
  error: {
    textAlign: 'center',
    color: palette.text.error,
  },
  subscribeButton: {
    marginTop: spacing(1),
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: spacing(2),
  },
  restoreText: {
    color: palette.text.secondary,
    textDecorationLine: 'underline',
  },
}));

export default themedStyles;

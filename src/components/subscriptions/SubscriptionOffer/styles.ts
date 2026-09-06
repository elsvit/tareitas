import { styleSheetFactory, spacing } from '~/styles';
import { Colors } from '~/styles/colors';

const themedStyles = styleSheetFactory(() => ({
  container: {
    gap: spacing(3),
  },
  title: {
    textAlign: 'center',
    color: Colors.grey800,
  },
  message: {
    textAlign: 'center',
    color: Colors.grey500,
    lineHeight: 22,
  },
  price: {
    textAlign: 'center',
    color: Colors.grey800,
  },
  loader: {
    marginVertical: spacing(2),
  },
  error: {
    textAlign: 'center',
    color: Colors.red500,
  },
  subscribeButton: {
    marginTop: spacing(1),
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: spacing(2),
  },
  restoreText: {
    color: Colors.grey500,
    textDecorationLine: 'underline',
  },
}));

export default themedStyles;

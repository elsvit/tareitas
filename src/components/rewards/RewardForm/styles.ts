import { StyleSheet } from 'react-native';

import { SCREEN_TEXT } from '~/constants/formField';
import { Colors, spacing } from '~/styles';

export const styles = StyleSheet.create({
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  container: {
    padding: 16,
  },
  formRoot: {
    flex: 1,
  },
  titleContainer: {
    margin: spacing(2),
    alignItems: 'center',
  },
  title: {
    color: SCREEN_TEXT.primary,
  },
  errorText: {
    color: Colors.red500,
    marginTop: spacing(1),
  },
});

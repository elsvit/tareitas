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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
});

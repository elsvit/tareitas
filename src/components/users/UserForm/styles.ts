import { StyleSheet } from 'react-native';

import { SCREEN_TEXT } from '~/constants/formField';
import { spacing } from '~/styles';
import { Colors } from '~/styles';

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
  row: {
    flexDirection: 'row',
  },
  firstInRow: {
    flex: 1,
    marginRight: spacing(2),
  },
  secondInRow: {
    flex: 1,
    marginLeft: spacing(2),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledSwitch: {
    marginRight: spacing(2),
  },
  errorText: {
    color: Colors.red500,
    marginTop: spacing(1),
  },
  label: {
    marginBottom: 8,
    color: SCREEN_TEXT.primary,
  },
  otpInput: {
    flex: 1,
    marginLeft: spacing(2),
  },
});

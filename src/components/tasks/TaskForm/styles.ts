import { StyleSheet } from 'react-native';

import { Colors, spacing } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  titleContainer: {
    margin: spacing(2),
    alignItems: 'center',
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
  },
  otpInput: {
    flex: 1,
    marginLeft: spacing(2),
  },
});

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
    justifyContent: 'space-between',
  },
  switchLabel: {
    marginLeft: 8,
    flex: 1,
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
  subtaskFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    minHeight: 72,
  },
  subtaskRemoveWrap: {
    width: 48,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskRemoveButton: {
    width: 48,
    height: 56,
    borderRadius: 12,
  },
  otpInput: {
    flex: 1,
    marginLeft: spacing(2),
  },
});

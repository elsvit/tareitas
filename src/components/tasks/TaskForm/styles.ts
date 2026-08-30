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
  subtasksContainer: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    backgroundColor: Colors.grey100,
  },
  subtaskFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    minHeight: 32,
    fontSize: 14,
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

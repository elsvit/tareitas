import { StyleSheet } from 'react-native';

import { Colors, spacing } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing(1),
    width: '100%',
  },
  iconActionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.grey200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionButtonDisabled: {
    opacity: 0.5,
  },
  timerSlot: {
    minHeight: 16,
    marginTop: spacing(0.5),
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timerText: {
    color: Colors.grey700,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 16,
  },
  timerTextHidden: {
    opacity: 0,
  },
  errorText: {
    marginTop: spacing(0.5),
    color: Colors.red500,
    textAlign: 'right',
    width: '100%',
    fontSize: 12,
    lineHeight: 16,
  },
});

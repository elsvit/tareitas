import { StyleSheet } from 'react-native';

import { Colors, spacing } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  label: {
    marginBottom: spacing(1),
    color: Colors.grey700,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    flexWrap: 'wrap',
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.red500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  actionChip: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderRadius: 12,
    backgroundColor: Colors.grey200,
  },
  actionChipDisabled: {
    opacity: 0.5,
  },
  actionChipText: {
    color: Colors.grey900,
    fontSize: 14,
  },
  timerText: {
    marginTop: spacing(1),
    color: Colors.grey700,
  },
  errorText: {
    marginTop: spacing(1),
    color: Colors.red500,
  },
});

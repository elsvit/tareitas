import { StyleSheet } from 'react-native';

import { Colors, spacing } from '~/styles';

export const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.grey600,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.green500,
    borderColor: Colors.green500,
  },
  checkboxDisabled: {
    opacity: 0.7,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: -1,
  },
  label: {
    flex: 1,
    color: Colors.grey700,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'left',
    includeFontPadding: false,
  },
  iconActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.grey200,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconActionButtonDisabled: {
    opacity: 0.45,
  },
  photoThumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.grey200,
    overflow: 'hidden',
    flexShrink: 0,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: spacing(0.5),
    color: Colors.red500,
    fontSize: 12,
    lineHeight: 16,
  },
});

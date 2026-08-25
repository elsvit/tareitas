import { StyleSheet } from 'react-native';

import { FORM_FIELD } from '~/constants/formField';
import { spacing } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'stretch',
    gap: spacing(2),
  },

  // OTP boxes in ONE horizontal row
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(3),
    width: '100%',
  },

  // Single PIN box
  slot: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderRadius: spacing(3),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FORM_FIELD.background,
  },

  slotText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
    color: FORM_FIELD.text,
  },

  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
});

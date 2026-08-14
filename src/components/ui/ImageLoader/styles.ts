import { StyleSheet } from 'react-native';

import { FORM_FIELD, SCREEN_TEXT } from '~/constants/formField';
import { spacing } from '~/styles';
import { Colors } from '~/styles';

export const PREVIEW_SIZE = 56;

export const styles = StyleSheet.create({
  container: {
    gap: spacing(2),
  },
  label: {
    color: SCREEN_TEXT.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  previewOuter: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FORM_FIELD.background,
  },
  previewOuterSelected: {
    borderColor: '#22C55E',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  actions: {
    flex: 1,
    gap: spacing(2),
  },
  errorText: {
    color: Colors.red500,
  },
});

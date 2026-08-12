import { StyleSheet } from 'react-native';

import { FORM_FIELD } from '~/constants/formField';
import { INPUT_HEIGHT } from '~/constants/sizes';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  outlineStyle: {
    borderRadius: 12,
    borderColor: FORM_FIELD.border,
  },
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: FORM_FIELD.background,
  },
  menuContent: {
    backgroundColor: FORM_FIELD.menuBackground,
  },
  menuScroll: {
    maxHeight: 320,
    backgroundColor: FORM_FIELD.menuBackground,
  },
  menuItem: {
    paddingVertical: 8,
    backgroundColor: FORM_FIELD.menuBackground,
  },
  menuItemTitle: {
    color: FORM_FIELD.menuText,
  },
});

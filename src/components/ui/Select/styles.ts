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
    maxWidth: '100%',
  },
  menuScroll: {
    maxHeight: 320,
    backgroundColor: FORM_FIELD.menuBackground,
  },
  menuItem: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: FORM_FIELD.menuBackground,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  menuItemIconSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    flex: 1,
    color: FORM_FIELD.menuText,
  },
});

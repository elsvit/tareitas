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
  anchorWrapper: {
    position: 'relative',
    minHeight: INPUT_HEIGHT,
    overflow: 'hidden',
  },
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: FORM_FIELD.background,
  },
  inputContentWithChips: {
    paddingRight: 8,
  },
  clearAllButton: {
    position: 'absolute',
    right: 44,
    top: 20,
    bottom: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
    borderRadius: 999,
    padding: 4,
    zIndex: 3,
  },
  chipsScroll: {
    position: 'absolute',
    left: 12,
    top: 13,
    bottom: 6,
    zIndex: 2,
  },
  chipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
    maxWidth: 160,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ECEFF1',
  },
  chipText: {
    color: FORM_FIELD.text,
    fontSize: 13,
    flexShrink: 1,
  },
  chipRemove: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
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

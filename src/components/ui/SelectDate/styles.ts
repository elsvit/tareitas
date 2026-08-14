import { StyleSheet } from 'react-native';

import { FORM_FIELD } from '~/constants/formField';
import { INPUT_HEIGHT } from '~/constants/sizes';

export const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  inputPressable: {
    width: '100%',
  },
  anchorWrapper: {
    position: 'relative',
  },
  outlineStyle: {
    borderRadius: 12,
    borderColor: FORM_FIELD.border,
  },
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: FORM_FIELD.background,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: FORM_FIELD.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sheetTitle: {
    marginBottom: 8,
    color: FORM_FIELD.text,
  },
  pickerContainer: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});

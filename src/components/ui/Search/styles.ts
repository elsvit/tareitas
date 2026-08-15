import { StyleSheet } from 'react-native';

import { FORM_FIELD } from '~/constants/formField';
import { INPUT_HEIGHT } from '~/constants/sizes';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: FORM_FIELD.background,
  },
  content: {
    paddingLeft: 0,
    marginLeft: 40,
  },
  leftIcon: {
    marginLeft: -8,
  },
  outlineStyle: {
    borderRadius: 12,
    borderColor: FORM_FIELD.border,
  },
});

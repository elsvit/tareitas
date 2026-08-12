import * as React from 'react';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

import {
  FORM_FIELD,
  FORM_FIELD_PAPER_THEME,
} from '~/constants/formField';

export type TextInputProps = ComponentProps<typeof PaperTextInput>;

export function TextInput({
  outlineStyle,
  outlineColor,
  activeOutlineColor,
  textColor,
  theme,
  style,
  ...rest
}: TextInputProps) {
  return (
    <PaperTextInput
      mode="outlined"
      outlineStyle={[styles.outline, outlineStyle as any]}
      outlineColor={outlineColor ?? FORM_FIELD.border}
      activeOutlineColor={activeOutlineColor ?? FORM_FIELD.borderActive}
      textColor={textColor ?? FORM_FIELD.text}
      theme={theme ?? FORM_FIELD_PAPER_THEME}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

TextInput.Icon = PaperTextInput.Icon;

const styles = StyleSheet.create({
  outline: {
    borderRadius: 12,
    borderColor: FORM_FIELD.border,
  },
  input: {
    backgroundColor: FORM_FIELD.background,
  },
});

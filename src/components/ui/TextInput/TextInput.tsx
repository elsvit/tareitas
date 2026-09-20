import * as React from 'react';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

import {
  FORM_FIELD,
  FORM_FIELD_PAPER_THEME,
} from '~/constants/formField';

export type TextInputProps = ComponentProps<typeof PaperTextInput>;

const TextInputRoot = React.forwardRef<
  React.ComponentRef<typeof PaperTextInput>,
  TextInputProps
>(function TextInput(
  {
    outlineStyle,
    outlineColor,
    activeOutlineColor,
    textColor,
    theme,
    style,
    ...rest
  },
  ref,
) {
  return (
    <PaperTextInput
      ref={ref}
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
});

type TextInputComponent = typeof TextInputRoot & {
  Affix: typeof PaperTextInput.Affix;
  Icon: typeof PaperTextInput.Icon;
};

export const TextInput = Object.assign(TextInputRoot, {
  Affix: PaperTextInput.Affix,
  Icon: PaperTextInput.Icon,
}) as TextInputComponent;

const styles = StyleSheet.create({
  outline: {
    borderRadius: 12,
    borderColor: FORM_FIELD.border,
  },
  input: {
    backgroundColor: FORM_FIELD.background,
  },
});

import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { Menu, TextInput as PaperTextInput } from 'react-native-paper';

import { TextInput } from '~/components/ui/TextInput';
import { FORM_FIELD, FORM_FIELD_MENU_THEME } from '~/constants/formField';
import { IOptions } from '~/types/ICommon';

import { styles } from './styles';

export type SelectProps = {
  label?: string;
  options: IOptions<any>[];
  value: any;
  onChange: (value: any) => void;
};

export function Select({ label, options, value, onChange }: SelectProps) {
  const [visible, setVisible] = React.useState(false);

  const displayValue = React.useMemo(() => {
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption?.label || '';
  }, [options, value]);

  const handleSetVisibleOn = () => {
    setVisible(true);
  };

  const handleSetVisibleOff = () => {
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={handleSetVisibleOff}
        theme={FORM_FIELD_MENU_THEME}
        contentStyle={styles.menuContent}
        anchor={
          <TextInput
            mode="outlined"
            label={label}
            value={displayValue}
            editable={false}
            multiline={false}
            onPressIn={handleSetVisibleOn}
            right={
              <PaperTextInput.Icon
                icon={visible ? 'chevron-up' : 'chevron-down'}
                onPress={handleSetVisibleOn}
                forceTextInputFocus={false}
                accessibilityLabel="Open menu"
                color={FORM_FIELD.label}
              />
            }
            outlineStyle={styles.outlineStyle}
            style={styles.input}
          />
        }
      >
        <ScrollView style={styles.menuScroll} bounces={false}>
          {options.map(option => {
            const selected = value === option.value;

            return (
              <Menu.Item
                key={String(option.value)}
                title={option.label}
                onPress={() => {
                  onChange(option.value);
                  setVisible(false);
                }}
                leadingIcon={selected ? 'check' : undefined}
                style={styles.menuItem}
                titleStyle={styles.menuItemTitle}
              />
            );
          })}
        </ScrollView>
      </Menu>
    </View>
  );
}

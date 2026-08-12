import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { Menu, TextInput as PaperTextInput } from 'react-native-paper';

import { FORM_FIELD, FORM_FIELD_MENU_THEME } from '~/constants/formField';
import { TextInput } from '~/components/ui/TextInput';

import { IOptions } from '~/types/ICommon';

import { styles } from './styles';

type BaseSelectProps = {
  label?: string;
  options: IOptions<any>[];
};

type SingleSelectProps = BaseSelectProps & {
  isMultiple?: false;
  value: any;
  onChange: (value: any) => void;
};

type MultipleSelectProps = BaseSelectProps & {
  isMultiple: true;
  value: any[];
  onChange: (value: any[]) => void;
};

export type SelectProps = SingleSelectProps | MultipleSelectProps;

export function Select({ label, options, ...rest }: SelectProps) {
  const [visible, setVisible] = React.useState(false);
  const isMultiple = (rest as MultipleSelectProps).isMultiple;

  // Build helper maps once per options change
  const valueToLabel = React.useMemo(
    () => new Map(options.map(opt => [opt.value, opt.label] as const)),
    [options],
  );
  const orderMap = React.useMemo(() => {
    const m = new Map<any, number>();
    options.forEach((opt, idx) => m.set(opt.value, idx));
    return m;
  }, [options]);

  const sortByOptionsOrder = React.useCallback(
    (values: any[]) => {
      if (!Array.isArray(values)) return [] as any[];
      // stable sort according to the order of options; unknown values go last in original order
      return [...values].sort((a, b) => {
        const ai = orderMap.get(a);
        const bi = orderMap.get(b);
        const aval = typeof ai === 'number' ? ai : Number.POSITIVE_INFINITY;
        const bval = typeof bi === 'number' ? bi : Number.POSITIVE_INFINITY;
        return aval - bval;
      });
    },
    [orderMap],
  );

  const displayValue = React.useMemo(() => {
    if (isMultiple) {
      const rawValues = (rest as MultipleSelectProps).value || [];
      if (!Array.isArray(rawValues) || rawValues.length === 0) return '';
      // Normalize: keep only values present in options and sort by options order
      const present = rawValues.filter(v => valueToLabel.has(v));
      const sorted = sortByOptionsOrder(present.length ? present : rawValues);
      if (sorted.length === 0) return '';
      // Show first selected (max 9 symbols) + ( +amount of left selected )
      const firstLabel = valueToLabel.get(sorted[0]) || String(sorted[0] ?? '');
      // If first label length > 9, show first 8 symbols + '...'
      const left = sorted.length - 1;
      const truncated =
        firstLabel.length > 7 ? `${firstLabel.slice(0, 6)}...` : firstLabel;
      return left > 0 ? `${truncated}(+${left})` : firstLabel;
    }
    const singleValue = (rest as SingleSelectProps).value;
    const selectedOption = options.find(opt => opt.value === singleValue);
    return selectedOption?.label || '';
  }, [isMultiple, options, rest, sortByOptionsOrder, valueToLabel]);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        theme={FORM_FIELD_MENU_THEME}
        contentStyle={styles.menuContent}
        anchor={
          <TextInput
            mode="outlined"
            label={label}
            value={displayValue}
            editable={false}
            multiline={false}
            onPressIn={() => setVisible(true)}
            right={
              <PaperTextInput.Icon
                icon="chevron-down"
                onPress={() => setVisible(true)}
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
            const handlePress = () => {
              if (isMultiple) {
                const current = (rest as MultipleSelectProps).value || [];
                const exists = current.includes(option.value);
                const next = exists
                  ? current.filter(v => v !== option.value)
                  : [...current, option.value];
                const sortedNext = sortByOptionsOrder(next);
                (rest as MultipleSelectProps).onChange(sortedNext);
              } else {
                (rest as SingleSelectProps).onChange(option.value);
                setVisible(false);
              }
            };

            const selected = isMultiple
              ? ((rest as MultipleSelectProps).value || []).includes(
                  option.value,
                )
              : (rest as SingleSelectProps).value === option.value;

            return (
              <Menu.Item
                key={option.value}
                title={option.label}
                onPress={handlePress}
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

import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Menu, TextInput as PaperTextInput } from 'react-native-paper';

import CrossIcon from '~/assets/svg/common/cross.svg';
import { Text } from '~/components/ui/Text';
import { TextInput } from '~/components/ui/TextInput';
import { FORM_FIELD, FORM_FIELD_MENU_THEME } from '~/constants/formField';
import { IOptions } from '~/types/ICommon';

import { styles } from './styles';

export type SelectMultiProps = {
  label?: string;
  options: IOptions<any>[];
  value: any[];
  onChange: (value: any[]) => void;
};

const FLOATING_LABEL_VALUE = '\u200B';

export function SelectMulti({
  label,
  options,
  value,
  onChange,
}: SelectMultiProps) {
  const [visible, setVisible] = React.useState(false);

  const valueToLabel = React.useMemo(
    () => new Map(options.map(opt => [opt.value, opt.label] as const)),
    [options],
  );

  const orderMap = React.useMemo(() => {
    const map = new Map<any, number>();
    options.forEach((opt, idx) => map.set(opt.value, idx));
    return map;
  }, [options]);

  const sortByOptionsOrder = React.useCallback(
    (values: any[]) => {
      if (!Array.isArray(values)) {
        return [] as any[];
      }

      return [...values].sort((a, b) => {
        const ai = orderMap.get(a);
        const bi = orderMap.get(b);
        const aOrder = typeof ai === 'number' ? ai : Number.POSITIVE_INFINITY;
        const bOrder = typeof bi === 'number' ? bi : Number.POSITIVE_INFINITY;
        return aOrder - bOrder;
      });
    },
    [orderMap],
  );

  const selectedValues = React.useMemo(() => {
    const rawValues = value || [];
    const present = rawValues.filter(item => valueToLabel.has(item));
    return sortByOptionsOrder(present.length ? present : rawValues);
  }, [sortByOptionsOrder, value, valueToLabel]);

  const hasSelection = selectedValues.length > 0;
  const shouldFloatLabel = hasSelection || visible;
  const chipsRightInset = hasSelection ? 72 : 40;

  const updateValue = React.useCallback(
    (nextValues: any[]) => {
      onChange(sortByOptionsOrder(nextValues));
    },
    [onChange, sortByOptionsOrder],
  );

  const openMenu = () => {
    setVisible(true);
  };

  const closeMenu = () => {
    setVisible(false);
  };

  const toggleOption = (optionValue: any) => {
    const current = value || [];
    const exists = current.includes(optionValue);
    const next = exists
      ? current.filter(item => item !== optionValue)
      : [...current, optionValue];

    updateValue(next);
  };

  const removeSelectedValue = (optionValue: any) => {
    const current = value || [];
    updateValue(current.filter(item => item !== optionValue));
  };

  const clearAllSelected = () => {
    updateValue([]);
  };

  const renderAnchor = () => (
    <View style={styles.anchorWrapper}>
      <TextInput
        mode="outlined"
        label={label}
        value={shouldFloatLabel ? FLOATING_LABEL_VALUE : ''}
        editable={false}
        multiline={false}
        onPressIn={openMenu}
        outlineStyle={styles.outlineStyle}
        style={styles.input}
        contentStyle={[
          hasSelection ? styles.inputContentWithChips : undefined,
          hasSelection ? { paddingRight: 32 } : undefined,
        ]}
        right={
          <PaperTextInput.Icon
            icon={visible ? 'chevron-up' : 'chevron-down'}
            onPress={openMenu}
            forceTextInputFocus={false}
            accessibilityLabel="Open menu"
            color={FORM_FIELD.label}
          />
        }
      />

      {hasSelection ? (
        <Pressable
          hitSlop={8}
          onPress={clearAllSelected}
          style={styles.clearAllButton}
          accessibilityLabel="Clear all selected"
        >
          <CrossIcon width={18} height={18} fill={FORM_FIELD.label} />
        </Pressable>
      ) : null}

      {hasSelection ? (
        <ScrollView
          horizontal
          style={[styles.chipsScroll, { right: chipsRightInset }]}
          contentContainerStyle={styles.chipsContent}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {selectedValues.map(item => (
            <Pressable
              key={String(item)}
              style={styles.chip}
              onPress={event => event.stopPropagation()}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {valueToLabel.get(item) || String(item ?? '')}
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => removeSelectedValue(item)}
                style={styles.chipRemove}
                accessibilityLabel="Remove selected item"
              >
                <CrossIcon width={12} height={12} fill={FORM_FIELD.label} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        theme={FORM_FIELD_MENU_THEME}
        contentStyle={styles.menuContent}
        anchor={renderAnchor()}
      >
        <ScrollView style={styles.menuScroll} bounces={false}>
          {options.map(option => {
            const selected = selectedValues.includes(option.value);
            const handlePress = () => toggleOption(option.value);

            return (
              <Menu.Item
                key={String(option.value)}
                title={option.label}
                onPress={handlePress}
                leadingIcon={
                  selected ? 'checkbox-marked' : 'checkbox-blank-outline'
                }
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

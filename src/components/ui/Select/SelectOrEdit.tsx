import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon, Menu, TextInput as PaperTextInput } from 'react-native-paper';

import { Search } from '~/components/ui/Search';
import { Text } from '~/components/ui/Text';
import { TextInput } from '~/components/ui/TextInput';
import { FORM_FIELD, FORM_FIELD_MENU_THEME } from '~/constants/formField';
import { t } from '~/services';
import { IOptions } from '~/types/ICommon';

import { styles } from './styles';

const MENU_WIDTH_RATIO = 0.9;

export type SelectOrEditProps<T> = {
  label?: string;
  options: IOptions<T>[];
  text: string;
  onTextChange: (value: string) => void;
  selectedValue?: T;
  onSelect: (value: T, label: string) => void;
  error?: string;
};

export function SelectOrEdit<T>({
  label,
  options,
  text,
  onTextChange,
  selectedValue,
  onSelect,
  error,
}: SelectOrEditProps<T>) {
  const [visible, setVisible] = React.useState(false);
  const [anchorWidth, setAnchorWidth] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

  const menuWidth =
    anchorWidth > 0 ? Math.round(anchorWidth * MENU_WIDTH_RATIO) : undefined;

  const normalizedSearchQuery = React.useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );

  const filteredOptions = React.useMemo(
    () =>
      normalizedSearchQuery
        ? options.filter(option =>
            option.label.toLowerCase().includes(normalizedSearchQuery),
          )
        : options,
    [normalizedSearchQuery, options],
  );

  const openMenu = () => {
    setVisible(true);
  };

  const closeMenu = () => {
    setVisible(false);
    setSearchQuery('');
  };

  return (
    <View
      style={styles.container}
      onLayout={event => setAnchorWidth(event.nativeEvent.layout.width)}
    >
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        theme={FORM_FIELD_MENU_THEME}
        contentStyle={[
          styles.menuContent,
          menuWidth ? { width: menuWidth } : undefined,
        ]}
        anchor={
          <TextInput
            mode="outlined"
            label={label}
            value={text}
            onChangeText={onTextChange}
            right={
              <PaperTextInput.Icon
                icon={visible ? 'chevron-up' : 'chevron-down'}
                onPress={openMenu}
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
        <View
          style={[
            styles.menuInner,
            menuWidth ? { width: menuWidth } : undefined,
          ]}
        >
          <View style={styles.searchContainer}>
            <Search
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('common.search')}
            />
          </View>

          <ScrollView
            style={styles.menuScroll}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                {t('common.no_data_found')}
              </Text>
            ) : (
              filteredOptions.map(option => {
                const selected = selectedValue === option.value;

                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => {
                      onSelect(option.value, option.label);
                      closeMenu();
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <View style={styles.menuItemRow}>
                      <View style={styles.menuItemIconSlot}>
                        {selected ? (
                          <Icon
                            source="check"
                            size={24}
                            color={FORM_FIELD.menuText}
                          />
                        ) : null}
                      </View>
                      <Text
                        variant="bodyLarge"
                        numberOfLines={2}
                        style={styles.menuItemTitle}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Menu>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

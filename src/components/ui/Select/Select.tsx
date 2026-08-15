import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon, Menu, TextInput as PaperTextInput } from 'react-native-paper';

import { Search } from '~/components/ui/Search';
import { Text } from '~/components/ui/Text';
import { TextInput } from '~/components/ui/TextInput';
import { FORM_FIELD, FORM_FIELD_MENU_THEME } from '~/constants/formField';
import { t } from '~/services';
import { IOptions } from '~/types/ICommon';

import { styles } from './styles';

export type SelectProps = {
  label?: string;
  options: IOptions<any>[];
  value: any;
  onChange: (value: any) => void;
};

const MENU_WIDTH_RATIO = 0.9;
const FLOATING_LABEL_VALUE = '\u200B';

export function Select({ label, options, value, onChange }: SelectProps) {
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

  const displayValue = React.useMemo(() => {
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption?.label || '';
  }, [options, value]);

  const hasSelection = Boolean(displayValue);
  const shouldFloatLabel = hasSelection || visible;

  const handleSetVisibleOn = () => {
    setVisible(true);
  };

  const handleSetVisibleOff = () => {
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
        onDismiss={handleSetVisibleOff}
        theme={FORM_FIELD_MENU_THEME}
        contentStyle={[
          styles.menuContent,
          menuWidth ? { width: menuWidth } : undefined,
        ]}
        anchor={
          <View style={styles.anchorWrapper}>
            <TextInput
              mode="outlined"
              label={label}
              value={shouldFloatLabel ? FLOATING_LABEL_VALUE : ''}
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
              contentStyle={hasSelection ? styles.inputContentWithValue : undefined}
            />

            {hasSelection ? (
              <View pointerEvents="none" style={styles.valueOverlay}>
                <Text
                  variant="bodyLarge"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.valueText}
                >
                  {displayValue}
                </Text>
              </View>
            ) : null}
          </View>
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
                const selected = value === option.value;

                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() => {
                      onChange(option.value);
                      setVisible(false);
                      setSearchQuery('');
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <View style={styles.menuItemRow}>
                      <View style={styles.menuItemIconSlot}>
                        {selected ? (
                          <Icon source="check" size={24} color={FORM_FIELD.menuText} />
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
    </View>
  );
}

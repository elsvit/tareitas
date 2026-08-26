import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Image } from 'expo-image';
import { Icon, Menu, TextInput as PaperTextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { BASE_REWARDS_IMAGES } from '~/assets/img/rewards/rewards';
import { Search } from '~/components/ui/Search';
import { Text } from '~/components/ui/Text';
import { TextInput } from '~/components/ui/TextInput';
import { FORM_FIELD, FORM_FIELD_MENU_THEME } from '~/constants/formField';
import { t } from '~/services';
import { selectRewardImageUrls } from '~/store/images';
import { IRewardAssignment } from '~/types/IReward';
import { resolvePictureSource } from '~/utils/pictureSource';

import { styles } from '~/components/ui/Select/styles';
import { styles as localStyles } from './PreviousRewardSelect.styles';

const MENU_WIDTH_RATIO = 0.9;
const FLOATING_LABEL_VALUE = '\u200B';

type Props = {
  label?: string;
  options: IRewardAssignment[];
  value?: string;
  onChange: (assignment: IRewardAssignment) => void;
};

function matchesSearchQuery(assignment: IRewardAssignment, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return (
    assignment.title.toLowerCase().includes(normalizedQuery) ||
    String(assignment.reward).includes(normalizedQuery)
  );
}

function PreviousRewardOptionRow({
  assignment,
  selected,
  customUrls,
}: {
  assignment: IRewardAssignment;
  selected: boolean;
  customUrls: Record<string, string>;
}) {
  const pictureSource = resolvePictureSource(
    assignment.picture,
    customUrls,
    BASE_REWARDS_IMAGES,
  );

  return (
    <View style={localStyles.optionRow}>
      <View style={localStyles.optionIconSlot}>
        {selected ? (
          <Icon source="check" size={24} color={FORM_FIELD.menuText} />
        ) : null}
      </View>

      <View style={localStyles.optionImageContainer}>
        {pictureSource ? (
          <Image
            source={pictureSource}
            style={localStyles.optionImage}
            contentFit="contain"
          />
        ) : (
          <Text fontFamily="fredoka" weight="bold">
            🎁
          </Text>
        )}
      </View>

      <View style={localStyles.optionTexts}>
        <Text
          variant="bodyLarge"
          numberOfLines={2}
          style={localStyles.optionTitle}
        >
          {assignment.title}
        </Text>
        <Text variant="bodyMedium" style={localStyles.optionReward}>
          ⭐ {assignment.reward}
        </Text>
      </View>
    </View>
  );
}

export function PreviousRewardSelect({
  label,
  options,
  value,
  onChange,
}: Props) {
  const customUrls = useSelector(selectRewardImageUrls);
  const [visible, setVisible] = React.useState(false);
  const [anchorWidth, setAnchorWidth] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

  const menuWidth =
    anchorWidth > 0 ? Math.round(anchorWidth * MENU_WIDTH_RATIO) : undefined;

  const selectedAssignment = React.useMemo(
    () => options.find(option => option.id === value),
    [options, value],
  );

  const filteredOptions = React.useMemo(
    () => options.filter(option => matchesSearchQuery(option, searchQuery)),
    [options, searchQuery],
  );

  const hasSelection = Boolean(selectedAssignment);
  const shouldFloatLabel = hasSelection || visible;

  const handleSetVisibleOn = () => {
    setVisible(true);
  };

  const handleSetVisibleOff = () => {
    setVisible(false);
    setSearchQuery('');
  };

  const selectedPictureSource = selectedAssignment
    ? resolvePictureSource(
        selectedAssignment.picture,
        customUrls,
        BASE_REWARDS_IMAGES,
      )
    : null;

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
              contentStyle={
                hasSelection ? styles.inputContentWithValue : undefined
              }
            />

            {selectedAssignment ? (
              <View pointerEvents="none" style={localStyles.valueOverlay}>
                <View style={localStyles.selectedValueRow}>
                  <View style={localStyles.selectedImageContainer}>
                    {selectedPictureSource ? (
                      <Image
                        source={selectedPictureSource}
                        style={localStyles.selectedImage}
                        contentFit="contain"
                      />
                    ) : (
                      <Text fontFamily="fredoka" weight="bold">
                        🎁
                      </Text>
                    )}
                  </View>
                  <View style={localStyles.selectedTexts}>
                    <Text
                      variant="bodyLarge"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={localStyles.selectedTitle}
                    >
                      {selectedAssignment.title}
                    </Text>
                    <Text variant="bodySmall" style={localStyles.selectedReward}>
                      ⭐ {selectedAssignment.reward}
                    </Text>
                  </View>
                </View>
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
              placeholder={t('rewards.search_by_title')}
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
                const selected = value === option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      onChange(option);
                      setVisible(false);
                      setSearchQuery('');
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <PreviousRewardOptionRow
                      assignment={option}
                      selected={selected}
                      customUrls={customUrls}
                    />
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

export default PreviousRewardSelect;

import React from 'react';
import { View } from 'react-native';

import CrossIcon from '~/assets/svg/common/cross.svg';
import SearchIcon from '~/assets/svg/common/search.svg';
import { TextInput } from '~/components/ui/TextInput';
import { FORM_FIELD } from '~/constants/formField';
import { t } from '~/services';

import { styles } from './styles';

const ICON_SIZE = 22;

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export const Search: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = t('tasks.search_by_title'),
  autoFocus = false,
}) => (
  <View style={styles.container}>
    <TextInput
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      style={styles.input}
      outlineStyle={styles.outlineStyle}
      contentStyle={styles.content}
      left={
        <TextInput.Icon
          icon={() => <SearchIcon width={ICON_SIZE} height={ICON_SIZE} />}
          forceTextInputFocus={false}
          style={styles.leftIcon}
        />
      }
      right={
        value ? (
          <TextInput.Icon
            icon={() => (
              <CrossIcon width={ICON_SIZE} height={ICON_SIZE} fill={FORM_FIELD.label} />
            )}
            onPress={() => onChangeText('')}
            forceTextInputFocus={false}
          />
        ) : undefined
      }
    />
  </View>
);

export default Search;

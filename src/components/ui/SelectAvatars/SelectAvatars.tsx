import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Image } from 'expo-image';

import { Text } from '~/components/ui';
import { t } from '~/services';

import { styles } from './styles';

type Option = {
  label: string;
  value: string;
};

type Props = {
  title?: string;
  options: Option[];
  images: Record<string, any>; // map value -> image source
  value?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
};

export const SelectAvatars: React.FC<Props> = ({
  title,
  options,
  images,
  value,
  errorMessage,
  onChange,
}) => {
  return (
    <>
      <Text style={styles.label}>{title || t('users.avatar')}</Text>
      <View style={styles.grid}>
        {options.map(opt => {
          const isSelected = value === opt.value;
          const source = images[opt.value as keyof typeof images];
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange?.(opt.value)}
              style={[
                styles.avatarOuter,
                {
                  borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                },
              ]}
            >
              <Image source={source} style={styles.avatarImage} />
            </TouchableOpacity>
          );
        })}
      </View>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </>
  );
};

export default SelectAvatars;

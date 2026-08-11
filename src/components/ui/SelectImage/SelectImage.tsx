import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Image } from 'expo-image';

import { Text } from '~/components/ui';
import { t } from '~/services';

import { IImageOption } from '~/types';
import { styles } from './styles';

// type Option = {
//   label: string;
//   value: string;
// };

type Props = {
  options: IImageOption[];
  value?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
};

export const SelectImage: React.FC<Props> = ({
  options,
  value,
  errorMessage,
  onChange,
}) => {
  console.log('TEST_31 SelectAvatars errorMessage: ', errorMessage);
  return (
    <>
      <Text style={styles.label}>{t('users.avatar') || 'Color'}</Text>
      <View style={styles.grid}>
        {options.map((opt, index) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={`${opt.value}-${index}`}
              onPress={() => onChange?.(opt.value)}
              style={[
                styles.avatarOuter,
                {
                  borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                },
              ]}
            >
              <Image source={opt.image} style={styles.avatarImage} />
            </TouchableOpacity>
          );
        })}
      </View>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </>
  );
};

export default SelectImage;

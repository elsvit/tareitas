import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleProp, ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { IOptions } from '~/types';

import { styles } from './styles';

type SelectColorProps = {
  options: IOptions<string>[];
  value: string;
  errorMessage?: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  optionTestIDPrefix?: string;
};

// Helpers & local styles for color picker
const hexToRgba = (hex: string, alpha: number): string => {
  // support shorthand #RGB and full #RRGGBB
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map(ch => ch + ch)
      .join('');
  }
  const num = parseInt(h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const SelectColor: React.FC<SelectColorProps> = ({
  options,
  value,
  errorMessage,
  onChange,
  style,
  optionTestIDPrefix,
}) => {
  return (
    <View style={style}>
      <Text style={styles.label}>{t('users.color') || 'Color'}</Text>
      <View style={styles.swatchGrid}>
        {options.map(opt => {
          const isSelected = value === opt.value;
          const gradient = [
            hexToRgba(opt.value as string, 1),
            hexToRgba(opt.value as string, 0.2),
          ];
          return (
            <TouchableOpacity
              key={String(opt.value)}
              testID={
                optionTestIDPrefix
                  ? `${optionTestIDPrefix}-${String(opt.label).toLowerCase()}`
                  : undefined
              }
              accessibilityRole="button"
              accessibilityLabel={`${opt.label} color`}
              onPress={() => onChange(opt.value as string)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.swatchOuter,
                {
                  borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                },
              ]}
            >
              <LinearGradient
                colors={gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.swatchInner}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

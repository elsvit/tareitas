import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';

import { Text } from '~/components/ui';
import { resolvePictureSource } from '~/utils/pictureSource';

type Props = {
  avatar?: string;
  name?: string;
  textColor?: string;
  customUrls: Record<string, string>;
  builtInImages: Record<string, ImageSourcePropType>;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function UserAvatar({
  avatar,
  name,
  textColor,
  customUrls,
  builtInImages,
  size = 48,
  style,
}: Props) {
  const [loadFailed, setLoadFailed] = useState(false);
  const source = useMemo(
    () =>
      resolvePictureSource(
        avatar,
        customUrls,
        builtInImages,
      ),
    [avatar, builtInImages, customUrls],
  );

  useEffect(() => {
    setLoadFailed(false);
  }, [avatar, source]);

  const showPlaceholder = !source || loadFailed;
  const fallbackLetter = name?.[0]?.toUpperCase() || '?';
  const fallbackFontSize = Math.max(14, Math.round(size * 0.38));

  return (
    <View
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {showPlaceholder ? (
        <View style={styles.placeholder}>
          <Text
            style={[
              styles.fallbackText,
              { fontSize: fallbackFontSize },
              textColor ? { color: textColor } : null,
            ]}
            numberOfLines={1}
          >
            {fallbackLetter}
          </Text>
        </View>
      ) : (
        <Image
          source={source}
          style={styles.image}
          contentFit="cover"
          onError={() => setLoadFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  fallbackText: {
    fontWeight: '700',
  },
});

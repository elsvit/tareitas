import React, { useMemo } from 'react';
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native';

import { Image, ImageContentFit, ImageStyle } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';

import { useResolvedMediaUrl } from '~/hooks/useResolvedMediaUrl';
import {
  isDisplayableMediaUri,
  isObjectStoragePath,
  toAbsoluteUploadUrl,
} from '~/services/api/uploadsApi';

type Props = {
  picture?: string | number;
  customUrls: Record<string, string>;
  builtInImages: Record<string, ImageSourcePropType>;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  placeholder?: React.ReactNode;
  placeholderStyle?: StyleProp<ViewStyle>;
};

export function ResolvedPicture({
  picture,
  customUrls,
  builtInImages,
  style,
  contentFit = 'contain',
  placeholder,
  placeholderStyle,
}: Props) {
  const customUri =
    typeof picture === 'string' ? customUrls[picture] : undefined;

  const staticUri = useMemo(() => {
    if (typeof picture !== 'string') {
      return null;
    }

    if (isDisplayableMediaUri(picture)) {
      return picture;
    }

    if (customUri && isDisplayableMediaUri(customUri)) {
      return customUri;
    }

    return toAbsoluteUploadUrl(picture);
  }, [customUri, picture]);

  const objectStoragePath = useMemo(() => {
    if (staticUri) {
      return null;
    }

    if (typeof picture === 'string' && isObjectStoragePath(picture)) {
      return picture;
    }

    if (customUri && isObjectStoragePath(customUri)) {
      return customUri;
    }

    return null;
  }, [customUri, picture, staticUri]);

  const resolvedObjectStorageUrl =
    useResolvedMediaUrl(objectStoragePath);
  const uri = staticUri ?? resolvedObjectStorageUrl;

  if (picture == null || picture === '') {
    return placeholder ?? null;
  }

  if (typeof picture === 'number') {
    return (
      <Image
        source={picture}
        style={style}
        contentFit={contentFit}
      />
    );
  }

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={style}
        contentFit={contentFit}
      />
    );
  }

  if (picture in builtInImages) {
    return (
      <Image
        source={
          builtInImages[
            picture as keyof typeof builtInImages
          ]
        }
        style={style}
        contentFit={contentFit}
      />
    );
  }

  if (objectStoragePath) {
    return (
      <View style={placeholderStyle ?? style}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return placeholder ?? null;
}

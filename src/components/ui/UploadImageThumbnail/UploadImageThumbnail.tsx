import React from 'react';
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native';

import { Image, ImageStyle } from 'expo-image';

import { useResolvedMediaUrl } from '~/hooks/useResolvedMediaUrl';
import {
  isDisplayableMediaUri,
  isObjectStoragePath,
} from '~/services/api/uploadsApi';

type Props = {
  imageRef: string;
  uri?: string;
  style: StyleProp<ImageStyle>;
  placeholderStyle?: StyleProp<ViewStyle>;
};

function resolveThumbnailSource(
  imageRef: string,
  uri?: string,
): string {
  if (uri && isDisplayableMediaUri(uri)) {
    return uri;
  }

  if (
    uri &&
    (isObjectStoragePath(uri) || uri.startsWith('/uploads/'))
  ) {
    return uri;
  }

  if (isDisplayableMediaUri(imageRef)) {
    return imageRef;
  }

  return imageRef;
}

export function UploadImageThumbnail({
  imageRef,
  uri,
  style,
  placeholderStyle,
}: Props) {
  const source = resolveThumbnailSource(imageRef, uri);
  const resolvedUrl = useResolvedMediaUrl(source);

  if (!resolvedUrl) {
    return (
      <View style={placeholderStyle ?? style}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return <Image source={{ uri: resolvedUrl }} style={style} />;
}

export function isResolvableUploadImageRef(
  imageRef: string,
): boolean {
  return (
    isDisplayableMediaUri(imageRef) ||
    imageRef.startsWith('/uploads/') ||
    isObjectStoragePath(imageRef)
  );
}

import type { ImageSource } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';

import { isDisplayableMediaUri, toAbsoluteUploadUrl } from '~/services/api/uploadsApi';

export const resolvePictureSource = (
  picture: string | number | undefined,
  customUrls: Record<string, string>,
  builtInImages: Record<string, ImageSourcePropType>,
): ImageSource | number | null => {
  if (picture == null || picture === '') {
    return null;
  }

  if (typeof picture === 'string') {
    if (/^(https?:\/\/|data:|file:)/.test(picture)) {
      return { uri: picture };
    }

    const uploadUrl = toAbsoluteUploadUrl(picture);

    if (uploadUrl) {
      if (Object.prototype.hasOwnProperty.call(customUrls, picture)) {
        const customUri = customUrls[picture];

        if (isDisplayableMediaUri(customUri)) {
          return { uri: customUri };
        }
      }

      return { uri: uploadUrl };
    }

    if (Object.prototype.hasOwnProperty.call(customUrls, picture)) {
      const customUri = customUrls[picture];

      if (isDisplayableMediaUri(customUri)) {
        return { uri: customUri };
      }
    }

    if (picture in builtInImages) {
      return builtInImages[picture as keyof typeof builtInImages] as ImageSource;
    }
  }

  if (typeof picture === 'number') {
    return picture;
  }

  return null;
};

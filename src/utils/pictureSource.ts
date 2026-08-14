import type { ImageSource } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';

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

    if (Object.prototype.hasOwnProperty.call(customUrls, picture)) {
      return { uri: customUrls[picture] };
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

import type { ImageSource } from 'expo-image';

export function isRemoteImageUri(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

export function getRemoteImageCachePolicy(
  uri: string | null | undefined,
): 'disk' | undefined {
  return uri && isRemoteImageUri(uri) ? 'disk' : undefined;
}

export function getImageSourceCachePolicy(
  source: ImageSource | number | null | undefined,
): 'disk' | undefined {
  if (!source || typeof source === 'number') {
    return undefined;
  }

  if ('uri' in source && typeof source.uri === 'string') {
    return getRemoteImageCachePolicy(source.uri);
  }

  return undefined;
}

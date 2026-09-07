import { Image } from 'react-native';

import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

import type { ImageStoreKind } from '~/store/images/types';

export const IMAGE_SIZE = 320;

const getImageDirectory = (kind: ImageStoreKind) =>
  new Directory(Paths.document, 'images', `${kind}s`);

const getImageFile = (kind: ImageStoreKind, id: string) =>
  new File(getImageDirectory(kind), `${id}.jpg`);

const getImageSize = (uri: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });

export const prepareSquareJpeg = async (uri: string): Promise<string> => {
  const { width, height } = await getImageSize(uri);
  const actions: ImageManipulator.Action[] = [];

  if (Math.abs(width - height) > 2) {
    const side = Math.min(width, height);
    const originX = Math.floor((width - side) / 2);
    const originY = Math.floor((height - side) / 2);
    actions.push({ crop: { originX, originY, width: side, height: side } });
  }

  actions.push({ resize: { width: IMAGE_SIZE, height: IMAGE_SIZE } });

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
};

export const saveImageToDevice = async (
  sourceUri: string,
  kind: ImageStoreKind,
  id: string,
): Promise<string> => {
  const preparedUri = await prepareSquareJpeg(sourceUri);
  const directory = getImageDirectory(kind);
  const destination = getImageFile(kind, id);

  directory.create({ intermediates: true, idempotent: true });
  new File(preparedUri).copy(destination);

  return destination.uri;
};

export const deleteImageFromDevice = async (uri?: string) => {
  if (!uri) {
    return;
  }

  const file = new File(uri);

  if (file.exists) {
    file.delete();
  }
};

export const isCustomImageId = (
  picture: string | undefined,
  customUrls: Record<string, string>,
): picture is string =>
  !!picture && Object.prototype.hasOwnProperty.call(customUrls, picture);

import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export const SUBTASK_PHOTO_MAX_DIMENSION = 512;
export const SUBTASK_PHOTO_MAX_BYTES = 200 * 1024;

const getFileSize = (uri: string): number => {
  const file = new File(uri);

  return file.exists ? file.size : Number.MAX_SAFE_INTEGER;
};

export async function prepareSubtaskPhotoJpeg(
  uri: string,
  sourceWidth?: number,
  sourceHeight?: number,
): Promise<string> {
  const maxSide = Math.max(sourceWidth ?? 0, sourceHeight ?? 0);
  const actions: ImageManipulator.Action[] = [];

  if (maxSide === 0 || maxSide > SUBTASK_PHOTO_MAX_DIMENSION) {
    actions.push({ resize: { width: SUBTASK_PHOTO_MAX_DIMENSION } });
  }

  let quality = 0.65;
  let preparedUri = uri;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    preparedUri = result.uri;

    if (getFileSize(result.uri) <= SUBTASK_PHOTO_MAX_BYTES) {
      return result.uri;
    }

    quality = 0.4;
  }

  return preparedUri;
}

export async function saveSubtaskPhotoToDevice(
  sourceUri: string,
  id: string,
  sourceWidth?: number,
  sourceHeight?: number,
): Promise<string> {
  const preparedUri = await prepareSubtaskPhotoJpeg(
    sourceUri,
    sourceWidth,
    sourceHeight,
  );
  const directory = new Directory(Paths.document, 'photos', 'subtasks');
  const destination = new File(directory, `${id}.jpg`);

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  await new File(preparedUri).copy(destination);

  return destination.uri;
}

export async function deleteSubtaskPhotoFromDevice(
  uri?: string | null,
): Promise<void> {
  if (!uri || !uri.startsWith('file://')) {
    return;
  }

  const file = new File(uri);

  if (file.exists) {
    file.delete();
  }
}

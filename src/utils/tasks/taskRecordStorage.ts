import * as FileSystem from 'expo-file-system/legacy';

export async function saveTaskRecordToDevice(
  sourceUri: string,
  id: string,
): Promise<string> {
  const documentDirectory = FileSystem.documentDirectory;

  if (!documentDirectory) {
    throw new Error('Document directory is unavailable');
  }

  const directory = `${documentDirectory}records/tasks/`;

  await FileSystem.makeDirectoryAsync(directory, {
    intermediates: true,
  });

  const destination = `${directory}${id}.m4a`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  return destination;
}

export async function deleteTaskRecordFromDevice(
  uri?: string | null,
): Promise<void> {
  if (!uri || !uri.startsWith('file://')) {
    return;
  }

  await FileSystem.deleteAsync(uri, { idempotent: true });
}

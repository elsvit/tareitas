import * as FileSystem from 'expo-file-system';

export async function saveTaskRecordToDevice(
  sourceUri: string,
  id: string,
): Promise<string> {
  const directory = `${FileSystem.documentDirectory}records/tasks/`;

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

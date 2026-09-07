import { Directory, File, Paths } from 'expo-file-system';

export async function saveTaskRecordToDevice(
  sourceUri: string,
  id: string,
): Promise<string> {
  const directory = new Directory(Paths.document, 'records', 'tasks');
  const destination = new File(directory, `${id}.m4a`);

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  await new File(sourceUri).copy(destination);

  return destination.uri;
}

export async function deleteTaskRecordFromDevice(
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

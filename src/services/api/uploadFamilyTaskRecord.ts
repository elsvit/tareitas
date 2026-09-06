import {
  uploadFamilyImage,
  type UploadedImageResponse,
} from './uploadsApi';
import type { ImageStoreKind } from '~/store/images/types';

export async function uploadFamilyTaskRecord(
  familyId: string,
  authToken: string,
  localUri: string,
): Promise<UploadedImageResponse> {
  return uploadFamilyImage(
    familyId,
    authToken,
    localUri,
    'task_record',
  );
}

export async function uploadFamilyTaskRecordWithSession(
  familyId: string,
  localUri: string,
): Promise<UploadedImageResponse> {
  const { uploadFamilyImageWithSession } = await import(
    './uploadFamilyImageWithSession'
  );

  return uploadFamilyImageWithSession(
    familyId,
    localUri,
    'task_record' satisfies ImageStoreKind,
  );
}

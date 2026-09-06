import type { ImageStoreKind } from '~/store/images/types';
import {
  isBuiltinAvatarId,
  isBuiltinPictureId,
  isLocalCustomImageRef,
  isRemoteImageRef,
} from '~/utils/imageRefs';

export {
  isBuiltinAvatarId,
  isBuiltinPictureId,
  isLocalCustomImageRef,
  isRemoteImageRef,
} from '~/utils/imageRefs';

export async function resolveImageRefForServer(
  value: string | undefined,
  localUrls: Record<string, string>,
  familyId: string,
  _authToken?: string,
  kind: ImageStoreKind = 'user',
): Promise<string | undefined> {
  if (
    !value ||
    isBuiltinPictureId(value, kind) ||
    isRemoteImageRef(value)
  ) {
    return value;
  }

  const localUri = localUrls[value];

  if (!localUri) {
    return value;
  }

  const { uploadFamilyImageWithSession } = await import(
    '~/services/api/uploadFamilyImageWithSession'
  );
  const uploaded = await uploadFamilyImageWithSession(
    familyId,
    localUri,
    kind,
  );

  return uploaded.path;
}

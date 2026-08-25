import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import { uploadFamilyImageWithSession } from '~/services/api/uploadFamilyImageWithSession';

const BUILTIN_AVATAR_IDS = new Set([
  ...PARENT_AVATARS.map(option => option.value),
  ...CHILDREN_AVATARS.map(option => option.value),
]);

export function isBuiltinAvatarId(
  value: string | undefined,
): boolean {
  return !!value && BUILTIN_AVATAR_IDS.has(value);
}

export function isRemoteImageRef(
  value: string | undefined,
): boolean {
  if (!value) {
    return false;
  }

  return /^(https?:\/\/|\/uploads\/)/.test(value);
}

export function isLocalCustomImageRef(
  value: string | undefined,
  localUrls: Record<string, string>,
): boolean {
  return (
    !!value &&
    !isBuiltinAvatarId(value) &&
    !isRemoteImageRef(value) &&
    Object.prototype.hasOwnProperty.call(localUrls, value)
  );
}

export async function resolveImageRefForServer(
  value: string | undefined,
  localUrls: Record<string, string>,
  familyId: string,
  authToken: string,
): Promise<string | undefined> {
  if (
    !value ||
    isBuiltinAvatarId(value) ||
    isRemoteImageRef(value)
  ) {
    return value;
  }

  const localUri = localUrls[value];

  if (!localUri) {
    return value;
  }

  const uploaded = await uploadFamilyImageWithSession(
    familyId,
    localUri,
  );

  return uploaded.path;
}

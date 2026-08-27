import { BASE_REWARDS_IMAGES } from '~/assets/img/rewards/rewards';
import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import { CHILDREN_AVATARS, PARENT_AVATARS } from '~/assets/img/users/users';
import { uploadFamilyImageWithSession } from '~/services/api/uploadFamilyImageWithSession';
import type { ImageStoreKind } from '~/store/images/types';

const BUILTIN_AVATAR_IDS = new Set([
  ...PARENT_AVATARS.map(option => option.value),
  ...CHILDREN_AVATARS.map(option => option.value),
]);

export function isBuiltinAvatarId(
  value: string | undefined,
): boolean {
  return !!value && BUILTIN_AVATAR_IDS.has(value);
}

export function isBuiltinPictureId(
  value: string | undefined,
  kind: ImageStoreKind = 'user',
): boolean {
  if (!value) {
    return false;
  }

  if (kind === 'task') {
    return Object.prototype.hasOwnProperty.call(
      BASE_TASKS_IMAGES,
      value,
    );
  }

  if (kind === 'reward') {
    return Object.prototype.hasOwnProperty.call(
      BASE_REWARDS_IMAGES,
      value,
    );
  }

  return isBuiltinAvatarId(value);
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
  kind: ImageStoreKind = 'user',
): boolean {
  return (
    !!value &&
    !isBuiltinPictureId(value, kind) &&
    !isRemoteImageRef(value) &&
    Object.prototype.hasOwnProperty.call(localUrls, value)
  );
}

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

  const uploaded = await uploadFamilyImageWithSession(
    familyId,
    localUri,
    kind,
  );

  return uploaded.path;
}

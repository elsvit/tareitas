import { isRemoteImageRef } from '~/services/imageSync';

export function isUploadPathForFamily(
  imageRef: string,
  familyId: string,
): boolean {
  return imageRef.startsWith(`/uploads/${familyId}/`);
}

export function isUploadUrlForFamily(
  imageRef: string,
  familyId: string,
): boolean {
  return imageRef.includes(`/uploads/${familyId}/`);
}

export function isImageRefForFamily(
  imageRef: string,
  familyId: string | null | undefined,
): boolean {
  if (!familyId) {
    return !isRemoteImageRef(imageRef);
  }

  if (imageRef.startsWith('/uploads/')) {
    return isUploadPathForFamily(imageRef, familyId);
  }

  if (/^https?:\/\//.test(imageRef)) {
    return isUploadUrlForFamily(imageRef, familyId);
  }

  return true;
}

export function filterFamilyImageEntries(
  entries: [string, string][],
  options: {
    familyId: string | null | undefined;
    usedIds: Set<string>;
    selectedId?: string;
  },
): [string, string][] {
  const { familyId, usedIds, selectedId } = options;

  return entries.filter(([id]) => {
    if (selectedId && id === selectedId) {
      return true;
    }

    if (usedIds.has(id)) {
      return isImageRefForFamily(id, familyId);
    }

    if (!familyId) {
      return false;
    }

    if (id.startsWith('/uploads/')) {
      return isUploadPathForFamily(id, familyId);
    }

    if (/^https?:\/\//.test(id)) {
      return isUploadUrlForFamily(id, familyId);
    }

    return false;
  });
}

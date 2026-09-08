import { isRemoteImageRef } from '~/utils/imageRefs';
import {
  isDisplayableMediaUri,
  isObjectStoragePath,
  toAbsoluteUploadUrl,
} from '~/services/api/uploadsApi';

export function isUploadPathForFamily(
  imageRef: string,
  familyId: string,
): boolean {
  return (
    imageRef.startsWith(`/uploads/${familyId}/`) ||
    imageRef.startsWith(`photos/${familyId}/`) ||
    imageRef.startsWith(`voice/${familyId}/`)
  );
}

export function isUploadUrlForFamily(
  imageRef: string,
  familyId: string,
): boolean {
  return (
    imageRef.includes(`/uploads/${familyId}/`) ||
    imageRef.includes(`/photos/${familyId}/`) ||
    imageRef.includes(`/voice/${familyId}/`)
  );
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

  if (
    imageRef.startsWith('photos/') ||
    imageRef.startsWith('voice/')
  ) {
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
      // Device-only / pre-family setup: local custom ids live in Redux only.
      return !isRemoteImageRef(id);
    }

    if (
      id.startsWith('/uploads/') ||
      id.startsWith('photos/') ||
      id.startsWith('voice/')
    ) {
      return isUploadPathForFamily(id, familyId);
    }

    if (/^https?:\/\//.test(id)) {
      return isUploadUrlForFamily(id, familyId);
    }

    return false;
  });
}

export function mergeFamilyUploadImageEntries(
  urlMap: Record<string, string>,
  usedIds: Set<string>,
  familyId: string | null | undefined,
): [string, string][] {
  const entries = new Map<string, string>(
    Object.entries(urlMap),
  );

  usedIds.forEach(id => {
    if (!isRemoteImageRef(id)) {
      return;
    }

    if (!isImageRefForFamily(id, familyId)) {
      return;
    }

    if (!entries.has(id)) {
      const candidate =
        urlMap[id] ?? toAbsoluteUploadUrl(id);

      if (candidate && isDisplayableMediaUri(candidate)) {
        entries.set(id, candidate);
      } else if (
        isObjectStoragePath(id) ||
        id.startsWith('/uploads/')
      ) {
        entries.set(id, candidate ?? id);
      }
    }
  });

  return [...entries.entries()];
}

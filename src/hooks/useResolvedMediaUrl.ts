import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  fetchMediaAccessUrl,
  isObjectStoragePath,
  toAbsoluteUploadUrl,
} from '~/services/api/uploadsApi';
import { selectAuthToken, selectFamilyId } from '~/store/settings/selectors';

export function useResolvedMediaUrl(
  path: string | null | undefined,
): string | null {
  const familyId = useSelector(selectFamilyId);
  const authToken = useSelector(selectAuthToken);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    () => {
      if (!path) {
        return null;
      }

      return toAbsoluteUploadUrl(path);
    },
  );

  useEffect(() => {
    if (!path) {
      setResolvedUrl(null);
      return;
    }

    const directUrl = toAbsoluteUploadUrl(path);

    if (directUrl) {
      setResolvedUrl(directUrl);
      return;
    }

    if (!isObjectStoragePath(path)) {
      setResolvedUrl(path);
      return;
    }

    if (!familyId || !authToken) {
      setResolvedUrl(null);
      return;
    }

    let cancelled = false;

    fetchMediaAccessUrl(familyId, authToken, path)
      .then(url => {
        if (!cancelled) {
          setResolvedUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken, familyId, path]);

  return resolvedUrl;
}

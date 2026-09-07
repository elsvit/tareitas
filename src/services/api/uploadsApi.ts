import { File } from 'expo-file-system';

import { API_CONFIG } from './config';
import { parseApiJson } from './client';
import { getApiLang } from './lang';
import type { ImageStoreKind } from '~/store/images/types';

export type UploadedImageResponse = {
  path: string;
  url: string;
};

export type ServerFamilyImage = {
  id: string;
  familyId: string;
  path: string;
  kind: ImageStoreKind;
  uploadedByUserId: string;
  createdAt: string;
  url?: string;
};

type FamilyImagesResponse = {
  images: ServerFamilyImage[];
};

type PresignUploadResponse = {
  uploadUrl: string;
  path: string;
  expiresIn: number;
};

type MediaAccessUrlResponse = {
  url: string;
  expiresIn: number | null;
};

const mediaAccessUrlCache = new Map<
  string,
  { url: string; expiresAt: number }
>();

function buildAuthHeaders(
  authToken: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
  };

  const lang = getApiLang();

  if (lang) {
    headers.lang = lang;
  }

  return headers;
}

export function isObjectStoragePath(
  path: string,
): boolean {
  return (
    path.startsWith('photos/') ||
    path.startsWith('voice/')
  );
}

export function isDisplayableMediaUri(
  value: string,
): boolean {
  return /^(https?:\/\/|file:|data:)/.test(value);
}

export function toAbsoluteUploadUrl(
  pathOrUrl: string | undefined,
): string | null {
  if (!pathOrUrl) {
    return null;
  }

  if (/^(https?:\/\/|file:|data:)/.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith('/uploads/')) {
    return `${API_CONFIG.baseUrl}${pathOrUrl}`;
  }

  return null;
}

export async function fetchMediaAccessUrl(
  familyId: string,
  authToken: string,
  path: string,
): Promise<string> {
  const cached = mediaAccessUrlCache.get(path);

  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.url;
  }

  const response = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads/access-url?path=${encodeURIComponent(path)}`,
    {
      headers: buildAuthHeaders(authToken),
    },
  );

  const data = await parseApiJson<MediaAccessUrlResponse>(
    response,
  );
  const expiresInMs = (data.expiresIn ?? 900) * 1000;

  mediaAccessUrlCache.set(path, {
    url: data.url,
    expiresAt: Date.now() + expiresInMs,
  });

  return data.url;
}

export function primeMediaAccessUrl(
  path: string,
  url: string,
  expiresInSeconds = 900,
): void {
  mediaAccessUrlCache.set(path, {
    url,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  });
}

function contentTypeForKind(
  kind?: ImageStoreKind,
): string {
  return kind === 'task_record'
    ? 'audio/m4a'
    : 'image/jpeg';
}

async function getLocalFileSize(
  localUri: string,
): Promise<number> {
  const file = new File(localUri);

  if (file.exists && file.size > 0) {
    return file.size;
  }

  const fileResponse = await fetch(localUri);
  const fileBody = await fileResponse.blob();

  if (fileBody.size <= 0) {
    throw new Error('Upload file not found');
  }

  return fileBody.size;
}

async function uploadViaPresign(
  familyId: string,
  authToken: string,
  localUri: string,
  kind: ImageStoreKind,
): Promise<UploadedImageResponse> {
  const contentType = contentTypeForKind(kind);
  const contentLength = await getLocalFileSize(localUri);

  const presignResponse = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads/presign`,
    {
      method: 'POST',
      headers: {
        ...buildAuthHeaders(authToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind,
        contentType,
        contentLength,
      }),
    },
  );

  if (presignResponse.status === 501) {
    throw new Error('PRESIGN_NOT_AVAILABLE');
  }

  const presign = await parseApiJson<PresignUploadResponse>(
    presignResponse,
  );

  const fileResponse = await fetch(localUri);
  const fileBody = await fileResponse.blob();

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: fileBody,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Object storage upload failed (${uploadResponse.status})`,
    );
  }

  const confirmResponse = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads/confirm`,
    {
      method: 'POST',
      headers: {
        ...buildAuthHeaders(authToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: presign.path,
        kind,
      }),
    },
  );

  const confirmed = await parseApiJson<UploadedImageResponse>(
    confirmResponse,
  );

  primeMediaAccessUrl(
    confirmed.path,
    confirmed.url,
    presign.expiresIn,
  );

  return confirmed;
}

async function uploadViaMultipart(
  familyId: string,
  authToken: string,
  localUri: string,
  kind?: ImageStoreKind,
): Promise<UploadedImageResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: kind === 'task_record' ? 'record.m4a' : 'image.jpg',
    type: contentTypeForKind(kind),
  } as unknown as Blob);

  if (kind) {
    formData.append('kind', kind);
  }

  const response = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads`,
    {
      method: 'POST',
      headers: buildAuthHeaders(authToken),
      body: formData,
    },
  );

  return parseApiJson<UploadedImageResponse>(response);
}

export async function uploadFamilyImage(
  familyId: string,
  authToken: string,
  localUri: string,
  kind?: ImageStoreKind,
): Promise<UploadedImageResponse> {
  if (kind) {
    try {
      return await uploadViaPresign(
        familyId,
        authToken,
        localUri,
        kind,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'PRESIGN_NOT_AVAILABLE'
      ) {
        return uploadViaMultipart(
          familyId,
          authToken,
          localUri,
          kind,
        );
      }

      throw error;
    }
  }

  return uploadViaMultipart(
    familyId,
    authToken,
    localUri,
    kind,
  );
}

export async function listFamilyImages(
  token: string,
  familyId: string,
) {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads/library`,
    {
      headers: buildAuthHeaders(token),
    },
  );

  const data = await parseApiJson<FamilyImagesResponse>(
    response,
  );

  data.images.forEach(image => {
    if (image.url) {
      primeMediaAccessUrl(image.path, image.url);
    }
  });

  return data;
}

export async function deleteFamilyImage(
  token: string,
  familyId: string,
  path: string,
) {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads/library`,
    {
      method: 'DELETE',
      headers: {
        ...buildAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    },
  );

  if (!response.ok) {
    return parseApiJson(response);
  }

  mediaAccessUrlCache.delete(path);
}

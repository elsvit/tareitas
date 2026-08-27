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
};

type FamilyImagesResponse = {
  images: ServerFamilyImage[];
};

export async function uploadFamilyImage(
  familyId: string,
  authToken: string,
  localUri: string,
  kind?: ImageStoreKind,
): Promise<UploadedImageResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  if (kind) {
    formData.append('kind', kind);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
  };

  const lang = getApiLang();

  if (lang) {
    headers.lang = lang;
  }

  const response = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

  return parseApiJson<UploadedImageResponse>(response);
}

export async function listFamilyImages(
  token: string,
  familyId: string,
) {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/families/${familyId}/uploads/library`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(getApiLang() ? { lang: getApiLang()! } : {}),
      },
    },
  );

  return parseApiJson<FamilyImagesResponse>(response);
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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(getApiLang() ? { lang: getApiLang()! } : {}),
      },
      body: JSON.stringify({ path }),
    },
  );

  if (!response.ok) {
    return parseApiJson(response);
  }
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

import { API_CONFIG } from './config';
import { parseApiJson } from './client';
import { getApiLang } from './lang';

export type UploadedImageResponse = {
  path: string;
  url: string;
};

export async function uploadFamilyImage(
  familyId: string,
  authToken: string,
  localUri: string,
): Promise<UploadedImageResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

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

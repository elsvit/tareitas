import {
  IFamilyCatalog,
  ISyncCatalogPayload,
} from '~/types/ICatalog';

import { apiFetch, parseApiJson } from './client';

export async function fetchFamilyCatalog(
  familyId: string,
  token: string,
  revisions: {
    taskRevision: number;
    rewardRevision: number;
  },
): Promise<IFamilyCatalog | null> {
  const params = new URLSearchParams({
    taskRevision: String(revisions.taskRevision),
    rewardRevision: String(revisions.rewardRevision),
  });

  const response = await apiFetch(
    `/families/${familyId}/catalog?${params.toString()}`,
    { token },
  );

  if (response.status === 304) {
    return null;
  }

  return parseApiJson<IFamilyCatalog>(response);
}

export async function syncFamilyCatalog(
  familyId: string,
  token: string,
  payload: ISyncCatalogPayload,
): Promise<IFamilyCatalog> {
  const response = await apiFetch(
    `/families/${familyId}/catalog/sync`,
    {
      method: 'POST',
      token,
      body: payload,
    },
  );

  return parseApiJson<IFamilyCatalog>(response);
}

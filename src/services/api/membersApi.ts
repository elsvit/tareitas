import { apiFetch, parseApiJson } from './client';

export type ServerParentMember = {
  userId: string;
  name: string;
  username: string;
  color?: string;
  avatar?: string;
  familyRole?: string;
  role: 'admin' | 'parent';
};

export type ServerChildMember = {
  userId: string;
  name: string;
  username: string;
  color?: string;
  avatar?: string;
  reward?: number;
  birthday?: string;
};

type CreateParentBody = {
  name: string;
  username: string;
  pin: string;
  familyRole?: string;
  color?: string;
  avatar?: string;
};

type UpdateParentBody = Partial<CreateParentBody>;

type CreateChildBody = {
  name: string;
  username: string;
  pin: string;
  color?: string;
  avatar?: string;
  birthday?: string;
  reward?: number;
};

type UpdateChildBody = Partial<CreateChildBody>;

export async function createParentMember(
  token: string,
  familyId: string,
  body: CreateParentBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/parents`,
    {
      method: 'POST',
      token,
      body,
    },
  );

  return parseApiJson<ServerParentMember>(response);
}

export async function updateParentMember(
  token: string,
  familyId: string,
  parentUserId: string,
  body: UpdateParentBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/parents/${parentUserId}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  );

  return parseApiJson<ServerParentMember>(response);
}

export type ServerMemberProfile = {
  userId: string;
  role: 'admin' | 'parent' | 'child';
  name: string;
  color?: string;
  avatar?: string;
};

export async function updateMyMemberProfile(
  token: string,
  familyId: string,
  body: {
    name?: string;
    color?: string;
    avatar?: string;
  },
) {
  const response = await apiFetch(
    `/families/${familyId}/members/me`,
    {
      method: 'PATCH',
      token,
      body,
    },
  );

  return parseApiJson<ServerMemberProfile>(response);
}

export async function deleteParentMember(
  token: string,
  familyId: string,
  parentUserId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/parents/${parentUserId}`,
    {
      method: 'DELETE',
      token,
    },
  );

  return parseApiJson<{ success: boolean }>(response);
}

export async function createChildMember(
  token: string,
  familyId: string,
  body: CreateChildBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/children`,
    {
      method: 'POST',
      token,
      body,
    },
  );

  return parseApiJson<ServerChildMember>(response);
}

export async function updateChildMember(
  token: string,
  familyId: string,
  childUserId: string,
  body: UpdateChildBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/children/${childUserId}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  );

  return parseApiJson<ServerChildMember>(response);
}

export async function deleteChildMember(
  token: string,
  familyId: string,
  childUserId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/children/${childUserId}`,
    {
      method: 'DELETE',
      token,
    },
  );

  return parseApiJson<{ success: boolean }>(response);
}

import { EFamilyRole, ERole } from '~/store/settings/enums';
import type { ChildFormProps, IChild } from '~/types/IChild';
import type { IParent, ParentFormProps } from '~/types/IParent';

import type {
  ServerChildMember,
  ServerParentMember,
} from './membersApi';

export function mapServerParentToLocal(
  server: ServerParentMember,
  createdBy: string,
  passwordPattern?: string,
  existing?: Partial<IParent>,
): IParent {
  return {
    id: server.userId,
    name: server.name,
    username: server.username,
    color: server.color ?? existing?.color,
    avatar: server.avatar ?? existing?.avatar,
    familyRole:
      (server.familyRole as EFamilyRole | undefined) ??
      existing?.familyRole,
    role: server.role === 'admin' ? ERole.admin : ERole.parent,
    passwordPattern:
      passwordPattern ?? existing?.passwordPattern,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdBy: existing?.createdBy ?? createdBy,
    updatedAt: new Date().toISOString(),
    email: existing?.email,
  };
}

export function mapServerChildToLocal(
  server: ServerChildMember,
  createdBy: string,
  passwordPattern?: string,
  existing?: Partial<IChild>,
): IChild {
  return {
    id: server.userId,
    name: server.name,
    username: server.username,
    color: server.color ?? existing?.color,
    avatar: server.avatar ?? existing?.avatar,
    reward: server.reward ?? existing?.reward,
    birthday: server.birthday ?? existing?.birthday,
    passwordPattern:
      passwordPattern ?? existing?.passwordPattern,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    createdBy: existing?.createdBy ?? createdBy,
    updatedAt: new Date().toISOString(),
  };
}

export function toCreateParentPayload(parent: ParentFormProps) {
  if (!parent.username?.trim()) {
    throw new Error('Username is required');
  }

  if (!parent.passwordPattern?.trim()) {
    throw new Error('Pin is required');
  }

  return {
    name: parent.name.trim(),
    username: parent.username.trim(),
    pin: parent.passwordPattern.trim(),
    familyRole: parent.familyRole,
    color: parent.color,
    avatar: parent.avatar,
  };
}

export function toUpdateParentPayload(parent: ParentFormProps) {
  const payload: {
    name?: string;
    username?: string;
    pin?: string;
    familyRole?: EFamilyRole;
    color?: string;
    avatar?: string;
  } = {
    name: parent.name.trim(),
    familyRole: parent.familyRole,
    color: parent.color,
    avatar: parent.avatar,
  };

  if (parent.username?.trim()) {
    payload.username = parent.username.trim();
  }

  if (parent.passwordPattern?.trim()) {
    payload.pin = parent.passwordPattern.trim();
  }

  return payload;
}

export function toCreateChildPayload(child: ChildFormProps) {
  if (!child.username?.trim()) {
    throw new Error('Username is required');
  }

  if (!child.passwordPattern?.trim()) {
    throw new Error('Pin is required');
  }

  return {
    name: child.name.trim(),
    username: child.username.trim(),
    pin: child.passwordPattern.trim(),
    color: child.color,
    avatar: child.avatar,
    birthday: child.birthday,
    reward: child.reward,
  };
}

export function toUpdateChildPayload(child: ChildFormProps) {
  const payload: {
    name?: string;
    username?: string;
    pin?: string;
    color?: string;
    avatar?: string;
    birthday?: string;
    reward?: number;
  } = {
    name: child.name.trim(),
    color: child.color,
    avatar: child.avatar,
    birthday: child.birthday,
    reward: child.reward,
  };

  if (child.username?.trim()) {
    payload.username = child.username.trim();
  }

  if (child.passwordPattern?.trim()) {
    payload.pin = child.passwordPattern.trim();
  }

  return payload;
}

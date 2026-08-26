import { t } from '~/services';
import type { AppDispatch } from '~/store/store';
import type { IState } from '~/store/types';
import type { IChild } from '~/types/IChild';
import type { IParent } from '~/types/IParent';
import {
  addChildSuccess,
  clearChildren,
  updateChild,
} from '~/store/children/slice';
import { selectParentById } from '~/store/parents/selectors';
import {
  addParentSuccess,
  clearParents,
  updateParent,
} from '~/store/parents/slice';
import { clearAllImageUrls } from '~/store/images/slice';
import { ERole } from '~/store/settings/enums';
import {
  clearAuthSession,
  clearMultideviceSession,
  setAuthUser,
  setCurrentRole,
  setCurrentUser,
  setMultideviceSession,
  setRequireLogin,
  syncCatalog,
  updateAuthTokens,
} from '~/store/settings/slice';
import {
  selectAuthToken,
  selectFamilyId,
} from '~/store/settings/selectors';
import { fetchFamilyDetails } from '~/services/api';
import {
  mapServerChildToLocal,
  mapServerParentToLocal,
} from '~/services/api/memberMappers';
import { selectAllChildren, selectChildById } from '~/store/children/selectors';
import type {
  IFamilyChildMember,
  IFamilyDetails,
  IFamilyParentMember,
  IAuthTokens,
  IAuthUser,
} from '~/types/IAuth';

function mapServerRole(
  role: IAuthUser['role'],
): ERole {
  if (role === 'admin') {
    return ERole.admin;
  }

  if (role === 'child') {
    return ERole.child;
  }

  return ERole.parent;
}

export function applyAuthTokensFromLogin(
  dispatch: AppDispatch,
  auth: IAuthTokens,
) {
  dispatch(
    updateAuthTokens({
      authToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    }),
  );
  dispatch(
    setAuthUser({
      id: auth.user.id,
      role: mapServerRole(auth.user.role),
    }),
  );
}

export function hydrateFamilyStore(
  dispatch: AppDispatch,
  family: IFamilyDetails,
  loggedInUser: IAuthUser,
  tokens: {
    accessToken: string;
    refreshToken: string;
  },
) {
  if (family.parents.length === 0) {
    throw new Error(t('onboarding.login.error_empty_family'));
  }

  const adminUserId = family.parents.find(
    parent => parent.role === 'admin',
  )?.userId;

  dispatch(clearParents());
  dispatch(clearChildren());
  dispatch(clearAllImageUrls());

  dispatch(
    setMultideviceSession({
      familyId: family.id,
      authToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      authUserId: loggedInUser.id,
      authUserRole: mapServerRole(loggedInUser.role),
    }),
  );
  dispatch(
    setAuthUser({
      id: loggedInUser.id,
      role: mapServerRole(loggedInUser.role),
    }),
  );

  for (const parent of family.parents) {
    dispatch(
      addParentSuccess({
        id: parent.userId,
        name: parent.name,
        role:
          parent.role === 'admin'
            ? ERole.admin
            : ERole.parent,
        familyRole: parent.familyRole as never,
        color: parent.color,
        avatar: parent.avatar,
        email: parent.email,
        username: parent.username,
        createdAt: new Date().toISOString(),
        createdBy: adminUserId ?? parent.userId,
      }),
    );
  }

  for (const child of family.children) {
    dispatch(
      addChildSuccess({
        id: child.userId,
        name: child.name,
        color: child.color,
        avatar: child.avatar,
        reward: child.reward,
        birthday: child.birthday,
        username: child.username?.trim() || undefined,
        createdAt: new Date().toISOString(),
        createdBy: adminUserId ?? loggedInUser.id,
      }),
    );
  }

  dispatch(setCurrentUser(loggedInUser.id));
  dispatch(setCurrentRole(mapServerRole(loggedInUser.role)));
  dispatch(setRequireLogin(false));
  dispatch(syncCatalog());
}

export type FamilyMemberCredentialUpdates = {
  parents: Array<{ entity: IParent }>;
  children: Array<{ entity: IChild }>;
};

function findLocalChildForServerMember(
  state: IState,
  serverChild: IFamilyChildMember,
) {
  const byId = selectChildById(state, serverChild.userId);

  if (byId) {
    return byId;
  }

  const serverName = serverChild.name.trim();

  if (!serverName) {
    return undefined;
  }

  const candidates = selectAllChildren(state).filter(child => {
    if (child.username?.trim()) {
      return false;
    }

    return child.name.trim() === serverName;
  });

  return candidates.length === 1 ? candidates[0] : undefined;
}

function buildChildCredentialUpdate(
  existing: IChild,
  serverChild: IFamilyChildMember,
) {
  const serverUsername = serverChild.username?.trim();

  if (!serverUsername) {
    return null;
  }

  const localUsername = existing.username?.trim();

  if (localUsername === serverUsername) {
    return null;
  }

  return {
    ...existing,
    username: serverUsername,
  };
}

function buildParentCredentialUpdate(
  existing: IParent,
  serverParent: IFamilyParentMember,
) {
  const isAdmin = serverParent.role === 'admin';

  if (isAdmin) {
    const serverEmail = serverParent.email?.trim();

    if (!serverEmail) {
      return null;
    }

    if (existing.email?.trim() === serverEmail) {
      return null;
    }

    return {
      ...existing,
      email: serverEmail,
    };
  }

  const serverUsername = serverParent.username?.trim();

  if (!serverUsername) {
    return null;
  }

  if (existing.username?.trim() === serverUsername) {
    return null;
  }

  return {
    ...existing,
    username: serverUsername,
  };
}

export type FamilyMembersSyncPlan = {
  parents: IParent[];
  children: IChild[];
  removeParentIds: string[];
  removeChildIds: string[];
};

export function buildFamilyMembersSyncPlan(
  family: IFamilyDetails,
  adminUserId: string,
  existingParents: IParent[],
  existingChildren: IChild[],
): FamilyMembersSyncPlan {
  const existingParentMap = new Map(
    existingParents.map(parent => [parent.id, parent]),
  );
  const existingChildMap = new Map(
    existingChildren.map(child => [child.id, child]),
  );

  const parents = family.parents.map(serverParent => {
    const existing = existingParentMap.get(serverParent.userId);

    return mapServerParentToLocal(
      serverParent,
      adminUserId,
      existing?.passwordPattern,
      existing,
    );
  });

  const children = family.children.map(serverChild => {
    const existing = existingChildMap.get(serverChild.userId);

    return mapServerChildToLocal(
      serverChild,
      adminUserId,
      existing?.passwordPattern,
      existing,
    );
  });

  const serverParentIds = new Set(
    family.parents.map(parent => parent.userId),
  );
  const serverChildIds = new Set(
    family.children.map(child => child.userId),
  );

  return {
    parents,
    children,
    removeParentIds: existingParents
      .map(parent => parent.id)
      .filter(id => !serverParentIds.has(id)),
    removeChildIds: existingChildren
      .map(child => child.id)
      .filter(id => !serverChildIds.has(id)),
  };
}

export async function collectFamilyMemberCredentialUpdates(
  state: IState,
): Promise<FamilyMemberCredentialUpdates> {
  const authToken = selectAuthToken(state);
  const familyId = selectFamilyId(state);
  const parents: FamilyMemberCredentialUpdates['parents'] = [];
  const children: FamilyMemberCredentialUpdates['children'] = [];

  if (!authToken || !familyId) {
    return { parents, children };
  }

  const family = await fetchFamilyDetails(authToken, familyId);

  for (const parent of family.parents) {
    const existing = selectParentById(state, parent.userId);

    if (!existing) {
      continue;
    }

    const entity = buildParentCredentialUpdate(
      existing,
      parent,
    );

    if (entity) {
      parents.push({ entity });
    }
  }

  for (const serverChild of family.children) {
    const existing = findLocalChildForServerMember(
      state,
      serverChild,
    );

    if (!existing) {
      continue;
    }

    const entity = buildChildCredentialUpdate(
      existing,
      serverChild,
    );

    if (entity) {
      children.push({ entity });
    }
  }

  return { parents, children };
}

export async function mergeFamilyMemberCredentials(
  getState: () => IState,
  dispatch: AppDispatch,
): Promise<void> {
  const updates = await collectFamilyMemberCredentialUpdates(
    getState(),
  );

  for (const { entity } of updates.parents) {
    dispatch(updateParent({ entity }));
  }

  for (const { entity } of updates.children) {
    dispatch(updateChild({ entity }));
  }
}

export function clearFamilyStore(dispatch: AppDispatch) {
  dispatch(clearParents());
  dispatch(clearChildren());
  dispatch(clearAllImageUrls());
  dispatch(clearAuthSession());
  dispatch(setCurrentUser(null));
  dispatch(setCurrentRole(null));
  dispatch(setRequireLogin(true));
}

/** Wipe local family and restart onboarding from the beginning. */
export function resetFamilyForOnboarding(dispatch: AppDispatch) {
  dispatch(clearParents());
  dispatch(clearChildren());
  dispatch(clearAllImageUrls());
  dispatch(clearMultideviceSession());
  dispatch(setCurrentUser(null));
  dispatch(setCurrentRole(null));
  dispatch(setRequireLogin(false));
}

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { selectParentById } from '~/store/parents/selectors';
import { ERole } from '~/store/settings/enums';
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsChild,
  selectIsParent,
  selectResolvedCurrentRole,
} from '~/store/settings/selectors';
import { IChild, IParent, IUserAvatar } from '~/types';

export function useCurrentUser() {
  const currentUserId = useSelector(selectCurrentUser);
  const currentUserRole = useSelector(selectResolvedCurrentRole);
  const isChild = useSelector(selectIsChild);
  const isParent = useSelector(selectIsParent);
  const isAdmin = useSelector(selectIsAdmin);

  const child = useSelector((state: RootStateT) => {
    if (!currentUserId) {
      return null;
    }

    return (selectChildById(state, currentUserId) ?? null) as IChild | null;
  });

  const parent = useSelector((state: RootStateT) => {
    if (!currentUserId) {
      return null;
    }

    return (selectParentById(state, currentUserId) ?? null) as IParent | null;
  });

  const user = useMemo<IUserAvatar | null>(() => {
    if (!currentUserId || !currentUserRole) {
      return null;
    }

    if (currentUserRole === ERole.child && child) {
      return {
        id: child.id,
        role: currentUserRole,
        name: child.name,
        avatar: child.avatar,
        color: child.color,
      };
    }

    if (
      (currentUserRole === ERole.parent || currentUserRole === ERole.admin) &&
      parent
    ) {
      return {
        id: parent.id,
        role: currentUserRole,
        name: parent.name,
        avatar: parent.avatar,
        color: parent.color,
      };
    }

    return null;
  }, [child, currentUserId, currentUserRole, parent]);

  return {
    user,
    currentUserId,
    currentUserRole,
    isChild,
    isParent,
    isAdmin,
  } as const;
}

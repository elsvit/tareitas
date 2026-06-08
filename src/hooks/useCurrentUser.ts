import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { selectParentById } from '~/store/parents/selectors';
import { ERole } from '~/store/settings/enums';
import {
  selectCurrentRole,
  selectCurrentUser,
} from '~/store/settings/selectors';
import { IChild, IParent, IUserAvatar } from '~/types';

export function useCurrentUser() {
  const currentUserId = useSelector(selectCurrentUser);
  const currentUserRole = useSelector(selectCurrentRole);

  const child = useSelector((state: RootStateT) => {
    if (!currentUserId) return null;
    if (currentUserRole !== ERole.child) return null;
    return (selectChildById(state, currentUserId) ?? null) as IChild | null;
  });

  const parent = useSelector((state: RootStateT) => {
    if (!currentUserId) return null;
    if (currentUserRole !== ERole.parent && currentUserRole !== ERole.admin)
      return null;
    return (selectParentById(state, currentUserId) ?? null) as IParent | null;
  });

  const user = useMemo<IUserAvatar | null>(() => {
    if (!currentUserId || !currentUserRole) return null;

    if (currentUserRole === ERole.child && child) {
      return {
        id: child.id,
        role: currentUserRole,
        name: child.name,
        avatar: child.avatar,
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
      };
    }

    return null;
  }, [child, currentUserId, currentUserRole, parent]);

  return { user, currentUserId, currentUserRole } as const;
}

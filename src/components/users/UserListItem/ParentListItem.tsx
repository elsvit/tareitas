import { useRouter } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { selectParentById } from '~/store/parents/selectors';
import { selectCurrentUser, selectIsAdmin } from '~/store/settings/selectors';
import { EScreens } from '~/types/ENavigation';
import { canEditUserProfile } from '~/utils/users/profilePermissions';
import { UserListItem } from './UserListItem';

type ParentListItemProps = {
  id: string;
  onPress?: () => void;
};

export const ParentListItem: React.FC<ParentListItemProps> = ({
  id,
  onPress,
}) => {
  const isAdmin = useSelector(selectIsAdmin);
  const currentUserId = useSelector(selectCurrentUser);
  const router = useRouter();

  const parent = useSelector(state => selectParentById(state as any, id));

  const canEdit = canEditUserProfile(isAdmin, currentUserId, id);

  const handlePress = React.useCallback(() => {
    if (!canEdit) {
      onPress?.();
      return;
    }

    router.push({ pathname: EScreens.ParentEdit as any, params: { id } });
  }, [canEdit, id, onPress, router]);

  if (!parent) return null;

  return (
    <UserListItem
      name={parent.name}
      // username={parent.username}
      familyRole={parent.familyRole}
      avatar={parent.avatar}
      color={parent.color}
      onPress={canEdit || onPress ? handlePress : undefined}
    />
  );
};

export default ParentListItem;

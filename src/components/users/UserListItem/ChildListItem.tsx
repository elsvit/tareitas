import { useRouter } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { selectChildById } from '~/store/children/selectors';
import {
  selectCurrentUser,
  selectIsAdmin,
  selectShowLoginName,
} from '~/store/settings/selectors';
import { EScreens } from '~/types/ENavigation';
import { canEditUserProfile } from '~/utils/users/profilePermissions';
import { UserListItem } from './UserListItem';

type Props = {
  id: string;
  onPress?: () => void;
};

export const ChildListItem: React.FC<Props> = ({ id, onPress }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const currentUserId = useSelector(selectCurrentUser);
  const router = useRouter();

  const child = useSelector(state => selectChildById(state as any, id));
  const showLoginName = useSelector(selectShowLoginName);

  const canEdit = canEditUserProfile(isAdmin, currentUserId, id);

  const handlePress = React.useCallback(() => {
    if (!canEdit) {
      onPress?.();
      return;
    }

    router.push({ pathname: EScreens.ChildEdit as any, params: { id } });
  }, [canEdit, id, onPress, router]);

  if (!child) return null;

  return (
    <UserListItem
      name={child.name}
      username={child.username}
      showLoginName={showLoginName}
      avatar={child.avatar}
      color={child.color}
      onPress={canEdit || onPress ? handlePress : undefined}
    />
  );
};

export default ChildListItem;

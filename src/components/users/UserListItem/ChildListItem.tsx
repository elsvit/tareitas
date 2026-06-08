import { useRouter } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { selectChildById } from '~/store/children/selectors';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { EScreens } from '~/types/ENavigation';
import { UserListItem } from './UserListItem';

type Props = {
  id: string;
  onPress?: () => void;
};

export const ChildListItem: React.FC<Props> = ({ id, onPress }) => {
  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;
  const router = useRouter();

  const child = useSelector(state => selectChildById(state as any, id));

  const handleEdit = React.useCallback(() => {
    router.push({ pathname: EScreens.ChildEdit as any, params: { id } });
  }, [id, router]);

  const handleDelete = React.useCallback(() => {
    router.push({ pathname: EScreens.ChildRemove as any, params: { id } });
  }, [id, router]);

  if (!child) return null;

  return (
    <UserListItem
      name={child.name}
      avatar={child.avatar}
      color={child.color}
      onPress={onPress}
      hasButtons={isAdmin}
      onEdit={isAdmin ? handleEdit : undefined}
      onDelete={isAdmin ? handleDelete : undefined}
    />
  );
};

export default ChildListItem;

import { useRouter } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

import { selectParentById } from '~/store/parents/selectors';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { EScreens } from '~/types/ENavigation';
import { UserListItem } from './UserListItem';

type ParentListItemProps = {
  id: string;
  role: ERole; // which store to read the entity from
  onPress?: () => void;
};

export const ParentListItem: React.FC<ParentListItemProps> = ({ id, role, onPress }) => {
  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;
  const router = useRouter();

  const parent = useSelector(state => selectParentById(state as any, id));

  const handleEdit = React.useCallback(() => {
      router.push({ pathname: EScreens.ParentEdit as any, params: { id } });
  }, [router, id]);

  const handleDelete = React.useCallback(() => {
      router.push({ pathname: EScreens.ParentRemove as any, params: { id } });
  }, [router, id]);

  if (!parent) return null;

  return (
    <UserListItem
      name={parent.name}
      familyRole={parent.familyRole}
      avatar={parent.avatar}
      color={parent.color}
      onPress={onPress}
      hasButtons={isAdmin}
      onEdit={isAdmin ? handleEdit : undefined}
      onDelete={isAdmin ? handleDelete : undefined}
    />
  );
};

export default ParentListItem;

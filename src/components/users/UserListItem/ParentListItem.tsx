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
  onPress?: () => void;
};

export const ParentListItem: React.FC<ParentListItemProps> = ({
  id,
  onPress,
}) => {
  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;
  const router = useRouter();

  const parent = useSelector(state => selectParentById(state as any, id));

  const handlePress = React.useCallback(() => {
    if (!isAdmin) {
      onPress?.();
      return;
    }

    router.push({ pathname: EScreens.ParentEdit as any, params: { id } });
  }, [id, isAdmin, onPress, router]);

  if (!parent) return null;

  return (
    <UserListItem
      name={parent.name}
      familyRole={parent.familyRole}
      avatar={parent.avatar}
      color={parent.color}
      onPress={isAdmin || onPress ? handlePress : undefined}
    />
  );
};

export default ParentListItem;

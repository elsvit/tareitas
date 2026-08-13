import { useSelector } from 'react-redux';

import { RootStateT } from '~/store';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole, selectCurrentUser } from '~/store/settings/selectors';
import { hasCompletedTasksInPast } from '~/store/tasks/taskFilters';

export function useHasCompletedTasksInPast(isHabit: boolean) {
  const currentUserId = useSelector(selectCurrentUser);
  const currentRole = useSelector(selectCurrentRole);
  const isChild = currentRole === ERole.child;

  return useSelector((state: RootStateT) =>
    hasCompletedTasksInPast(state, {
      isHabit,
      childId: isChild ? currentUserId ?? undefined : undefined,
    }),
  );
}

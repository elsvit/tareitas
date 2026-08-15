import { useSelector } from 'react-redux';

import { RootStateT } from '~/store';
import { selectCurrentUser, selectIsChild } from '~/store/settings/selectors';
import { hasCompletedTasksInPast } from '~/store/tasks/taskFilters';

export function useHasCompletedTasksInPast(isHabit: boolean) {
  const currentUserId = useSelector(selectCurrentUser);
  const isChild = useSelector(selectIsChild);

  return useSelector((state: RootStateT) =>
    hasCompletedTasksInPast(state, {
      isHabit,
      childId: isChild ? currentUserId ?? undefined : undefined,
    }),
  );
}

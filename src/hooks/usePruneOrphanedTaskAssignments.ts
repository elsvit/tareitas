import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectChildIds } from '~/store/children/selectors';
import { pruneOrphanedTaskAssignments } from '~/store/taskAssignment/slice';

export const usePruneOrphanedTaskAssignments = () => {
  const dispatch = useDispatch();
  const childIds = useSelector(selectChildIds);

  useEffect(() => {
    dispatch(pruneOrphanedTaskAssignments({ validChildIds: childIds }));
  }, [childIds, dispatch]);
};

import { taskAssignmentAdapter } from './slice';
import { IStateTaskAssignment } from './types';

export const findOrphanedTaskAssignmentIds = (
  state: IStateTaskAssignment,
  validChildIds: ReadonlySet<string> | readonly string[],
): string[] => {
  const validIds =
    validChildIds instanceof Set ? validChildIds : new Set(validChildIds);

  return state.ids.filter(id => {
    const assignment = state.entities[id];

    return !!assignment && !validIds.has(assignment.childId);
  });
};

export const pruneOrphanedTaskAssignmentsInState = (
  state: IStateTaskAssignment,
  validChildIds: ReadonlySet<string> | readonly string[],
): void => {
  const idsToRemove = findOrphanedTaskAssignmentIds(state, validChildIds);

  if (idsToRemove.length > 0) {
    taskAssignmentAdapter.removeMany(state, idsToRemove);
  }
};

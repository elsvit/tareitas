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

  if (idsToRemove.length === 0) {
    return;
  }

  const idsToRemoveSet = new Set(idsToRemove);

  for (const id of idsToRemove) {
    delete state.entities[id];
  }

  state.ids = state.ids.filter(id => !idsToRemoveSet.has(id));
};

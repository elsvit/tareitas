import { RootStateT } from '~/store';
import { taskAssignmentAdapter } from './slice';

// Base selectors
export const getTaskAssignmentState = (state: RootStateT) => state.taskAssignment;

// Adapter selectors
export const {
  selectAll: selectAllTaskAssignment,
  selectById,
  selectIds: selectTaskAssignmentIds,
  selectEntities: selectTaskAssignmentEntities,
  selectTotal: selectTotalTaskAssignment,
} = taskAssignmentAdapter.getSelectors((state: RootStateT) => state.taskAssignment);

export const selectTaskAssignmentById = (id: string) => (state: RootStateT) =>
  selectById(state, id);

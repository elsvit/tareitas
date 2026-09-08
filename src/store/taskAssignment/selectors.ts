import type { IState } from '~/store/types';
import { taskAssignmentAdapter } from './slice';

// Base selectors
export const getTaskAssignmentState = (state: IState) => state.taskAssignment;

// Adapter selectors
export const {
  selectAll: selectAllTaskAssignment,
  selectById,
  selectIds: selectTaskAssignmentIds,
  selectEntities: selectTaskAssignmentEntities,
  selectTotal: selectTotalTaskAssignment,
} = taskAssignmentAdapter.getSelectors((state: IState) => state.taskAssignment);

export const selectTaskAssignmentById = (id: string) => (state: RootStateT) =>
  selectById(state, id);

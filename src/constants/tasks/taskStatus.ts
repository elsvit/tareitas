import { ETaskStatus } from '~/types/ETask';

export const TASK_STATUS_COLORS: Record<ETaskStatus, string> = {
  [ETaskStatus.Pending]: '#9CA3AF',
  [ETaskStatus.Completed]: '#22C55E',
  [ETaskStatus.Approved]: '#F59E0B',
  [ETaskStatus.Rejected]: '#EF4444',
};

export const PARENT_STATUS_CYCLE: ETaskStatus[] = [
  ETaskStatus.Pending,
  ETaskStatus.Completed,
  ETaskStatus.Approved,
  ETaskStatus.Rejected,
];

export const getNextParentStatus = (current: ETaskStatus): ETaskStatus => {
  const index = PARENT_STATUS_CYCLE.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % PARENT_STATUS_CYCLE.length;

  return PARENT_STATUS_CYCLE[nextIndex];
};

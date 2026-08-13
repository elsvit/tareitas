import { Colors } from '~/styles/colors';
import { ETaskStatus } from '~/types/ETask';

export const TASK_STATUS_COLORS: Record<ETaskStatus, string> = {
  [ETaskStatus.Pending]: Colors.grey500, // #9CA3AF
  [ETaskStatus.Completed]: Colors.green500, // #22C55E
  [ETaskStatus.Approved]: Colors.green500, // #22C55E
  [ETaskStatus.Rejected]: Colors.red500, // #EF4444
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

export const normalizeTaskStatus = (
  status?: ETaskStatus | string | null,
): ETaskStatus => {
  if (status && Object.values(ETaskStatus).includes(status as ETaskStatus)) {
    return status as ETaskStatus;
  }

  return ETaskStatus.Pending;
};

import { ETaskStatus } from '~/types/ETask';
import { IChild } from '~/types/IChild';

export const TASK_CALENDAR_STATUSES: ETaskStatus[] = [
  ETaskStatus.Pending,
  ETaskStatus.Completed,
  ETaskStatus.Approved,
  ETaskStatus.Rejected,
];

export type TaskCalendarFilter = {
  childIds: Record<string, boolean>;
  statuses: Record<ETaskStatus, boolean>;
};

export const createDefaultTaskCalendarFilter = (
  children: IChild[],
): TaskCalendarFilter => ({
  childIds: Object.fromEntries(children.map(child => [child.id, true])),
  statuses: Object.fromEntries(
    TASK_CALENDAR_STATUSES.map(status => [status, true]),
  ) as Record<ETaskStatus, boolean>,
});

export const mergeTaskCalendarFilterChildren = (
  filter: TaskCalendarFilter,
  children: IChild[],
): TaskCalendarFilter => {
  const childIds = { ...filter.childIds };

  children.forEach(child => {
    if (!(child.id in childIds)) {
      childIds[child.id] = true;
    }
  });

  Object.keys(childIds).forEach(childId => {
    if (!children.some(child => child.id === childId)) {
      delete childIds[childId];
    }
  });

  return { ...filter, childIds };
};

export const isFilterGroupAllSelected = (
  checkedMap: Record<string, boolean>,
): boolean => {
  const values = Object.values(checkedMap);

  if (values.length === 0) {
    return true;
  }

  return values.every(Boolean) || values.every(value => !value);
};

export const getActiveTaskCalendarFilterCount = (
  filter: TaskCalendarFilter,
  includeChildrenFilter: boolean,
): number => {
  let count = 0;

  if (includeChildrenFilter && !isFilterGroupAllSelected(filter.childIds)) {
    count += 1;
  }

  if (!isFilterGroupAllSelected(filter.statuses)) {
    count += 1;
  }

  return count;
};

export const matchesTaskCalendarFilter = (
  childId: string,
  status: ETaskStatus,
  filter: TaskCalendarFilter,
  includeChildrenFilter: boolean,
): boolean => {
  if (
    includeChildrenFilter &&
    !isFilterGroupAllSelected(filter.childIds) &&
    !filter.childIds[childId]
  ) {
    return false;
  }

  if (
    !isFilterGroupAllSelected(filter.statuses) &&
    !filter.statuses[status]
  ) {
    return false;
  }

  return true;
};

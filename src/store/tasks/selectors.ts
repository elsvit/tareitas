import { createSelector } from '@reduxjs/toolkit';

import { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { ISubtask, ITask, ITaskAssignment, ITaskBase } from '~/types/ITask';
import { IChild } from '~/types/IChild';
import { ETaskStatus } from '~/types/ETask';
import { normalizeTaskStatus } from '~/constants/tasks/taskStatus';
import {
  createTaskId,
  shouldShowAssignmentOnDate,
} from '~/utils/tasks/taskGeneration';

import { tasksAdapter } from './slice';

export const getTasksState = (state: RootStateT) => state.tasks;

export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
  selectTotal: selectTotalTasks,
} = tasksAdapter.getSelectors((state: RootStateT) => state.tasks);

export type ScheduledTaskItem = {
  id: string;
  assignmentId: string;
  date: string;
  task: ITask | null;
};

const matchesHabitFilter = (
  assignment: ITaskAssignment | undefined,
  isHabit: boolean,
) => (isHabit ? assignment?.isHabit === true : !assignment?.isHabit);

export type TaskListItemView = {
  id: string;
  task: ITask | null;
  assignmentId: string;
  date: string;
  name: string;
  description?: string;
  reward?: number;
  picture?: string;
  childName: string;
  childColor: string;
  taskColor: string;
  time?: string;
  subtasks: ISubtask[];
  completedSubtasks: string[];
  isDone: boolean;
  status: ETaskStatus;
};

export const selectTasksByDate = (date: string, isHabit = false) =>
  createSelector(
    [selectAllTasks, (state: RootStateT) => state],
    (tasks, state) =>
      tasks
        .filter(task => task.date === date)
        .filter(task => {
          const assignment = selectTaskAssignmentById(task.assignmentId)(state);

          return matchesHabitFilter(assignment, isHabit);
        })
        .sort((a, b) => {
          const assignmentA = selectTaskAssignmentById(a.assignmentId)(state);
          const assignmentB = selectTaskAssignmentById(b.assignmentId)(state);

          return (assignmentA?.time ?? '').localeCompare(
            assignmentB?.time ?? '',
          );
        }),
  );

export const selectScheduledTasksForDate = (
  date: string,
  childId?: string | null,
  isHabit = false,
) =>
  createSelector(
    [selectAllTaskAssignment, selectTaskEntities],
    (assignments, taskEntities): ScheduledTaskItem[] =>
      assignments
        .filter(assignment => shouldShowAssignmentOnDate(assignment, date))
        .filter(assignment => !childId || assignment.childId === childId)
        .filter(assignment => matchesHabitFilter(assignment, isHabit))
        .map(assignment => {
          const id = createTaskId(assignment.id, date);

          return {
            id,
            assignmentId: assignment.id,
            date,
            task: taskEntities[id] ?? null,
          };
        })
        .sort((a, b) => {
          const assignmentA = assignments.find(item => item.id === a.assignmentId);
          const assignmentB = assignments.find(item => item.id === b.assignmentId);

          return (assignmentA?.time ?? '').localeCompare(
            assignmentB?.time ?? '',
          );
        }),
  );

const buildTaskListItemViewFromParts = (
  id: string,
  assignmentId: string,
  date: string,
  task: ITask | null | undefined,
  assignment: ITaskAssignment | undefined,
  child: IChild | undefined,
  taskBaseList: ITaskBase[],
): TaskListItemView | null => {
  if (!assignment) {
    return null;
  }

  const taskBase = assignment.picture
    ? taskBaseList.find(item => item.picture === assignment.picture)
    : undefined;

  const subtasks = assignment.subtasks ?? [];
  const completedSubtasks = task?.completedSubtasks ?? [];
  const allSubtasksDone =
    subtasks.length > 0 &&
    subtasks.every(subtask => completedSubtasks.includes(subtask.value));
  const isDone =
    task?.status === ETaskStatus.Completed ||
    task?.status === ETaskStatus.Approved ||
    allSubtasksDone;

  const status = normalizeTaskStatus(
    allSubtasksDone &&
      task?.status !== ETaskStatus.Approved &&
      task?.status !== ETaskStatus.Rejected
      ? ETaskStatus.Completed
      : task?.status ?? ETaskStatus.Pending,
  );

  return {
    id,
    task: task ?? null,
    assignmentId,
    date,
    name: assignment.title || taskBase?.name || date,
    description: assignment.description ?? taskBase?.description,
    reward: assignment.reward ?? taskBase?.reward,
    picture: assignment.picture ?? taskBase?.picture,
    childName: child?.name ?? '',
    childColor: child?.color ?? '#5CD304',
    taskColor: assignment.color ?? child?.color ?? '#5CD304',
    time: assignment.time,
    subtasks,
    completedSubtasks,
    isDone,
    status,
  };
};

export const selectTaskListItemViewByScheduledItem = createSelector(
  [
    (state: RootStateT, item: ScheduledTaskItem) => selectTaskById(state, item.id),
    (state: RootStateT, item: ScheduledTaskItem) =>
      selectTaskAssignmentById(item.assignmentId)(state),
    (state: RootStateT, item: ScheduledTaskItem) => {
      const assignment = selectTaskAssignmentById(item.assignmentId)(state);

      return assignment
        ? selectChildById(state, assignment.childId)
        : undefined;
    },
    selectAllTaskBase,
    (_state: RootStateT, item: ScheduledTaskItem) => item.id,
    (_state: RootStateT, item: ScheduledTaskItem) => item.assignmentId,
    (_state: RootStateT, item: ScheduledTaskItem) => item.date,
  ],
  (task, assignment, child, taskBaseList, id, assignmentId, date) =>
    buildTaskListItemViewFromParts(
      id,
      assignmentId,
      date,
      task,
      assignment,
      child,
      taskBaseList,
    ),
);

export const selectTaskListItemViewById = (taskId: string) =>
  createSelector(
    [
      (state: RootStateT) => selectTaskById(state, taskId),
      (state: RootStateT) => {
        const task = selectTaskById(state, taskId);

        return task
          ? selectTaskAssignmentById(task.assignmentId)(state)
          : undefined;
      },
      (state: RootStateT) => {
        const task = selectTaskById(state, taskId);
        const assignment = task
          ? selectTaskAssignmentById(task.assignmentId)(state)
          : undefined;

        return assignment
          ? selectChildById(state, assignment.childId)
          : undefined;
      },
      selectAllTaskBase,
    ],
    (task, assignment, child, taskBaseList) => {
      if (!task) {
        return null;
      }

      return buildTaskListItemViewFromParts(
        task.id,
        task.assignmentId,
        task.date,
        task,
        assignment,
        child,
        taskBaseList,
      );
    },
  );

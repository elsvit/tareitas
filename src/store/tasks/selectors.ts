import { createSelector } from '@reduxjs/toolkit';

import { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { ITask } from '~/types/ITask';

import { tasksAdapter } from './slice';

export const getTasksState = (state: RootStateT) => state.tasks;

export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
  selectTotal: selectTotalTasks,
} = tasksAdapter.getSelectors((state: RootStateT) => state.tasks);

export type TaskListItemView = {
  task: ITask;
  name: string;
  description?: string;
  reward?: number;
  picture?: string;
  childName: string;
  childColor: string;
  taskColor: string;
  time?: string;
};

export const selectTasksByDate = (date: string) =>
  createSelector(
    [selectAllTasks, (state: RootStateT) => state],
    (tasks, state) =>
      tasks
        .filter(task => task.date === date)
        .sort((a, b) => {
          const assignmentA = selectTaskAssignmentById(a.assignmentId)(state);
          const assignmentB = selectTaskAssignmentById(b.assignmentId)(state);

          return (assignmentA?.time ?? '').localeCompare(
            assignmentB?.time ?? '',
          );
        }),
  );

export const selectTaskListItemViewById =
  (taskId: string) =>
  (state: RootStateT): TaskListItemView | null => {
    const task = selectTaskById(state, taskId);

    if (!task) {
      return null;
    }

    const assignment = selectTaskAssignmentById(task.assignmentId)(state);

    if (!assignment) {
      return null;
    }

    const child = selectChildById(state, assignment.childId);
    const taskBase = assignment.picture
      ? selectAllTaskBase(state).find(
          item => item.picture === assignment.picture,
        )
      : undefined;

    return {
      task,
      name: assignment.title || taskBase?.name || task.date,
      description: assignment.description ?? taskBase?.description,
      reward: assignment.reward ?? taskBase?.reward,
      picture: assignment.picture ?? taskBase?.picture,
      childName: child?.name ?? '',
      childColor: child?.color ?? '#5CD304',
      taskColor: assignment.color ?? child?.color ?? '#5CD304',
      time: assignment.time,
    };
  };

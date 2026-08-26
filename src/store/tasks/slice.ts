import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStateTasks, RemoveTasksPayload } from './types';
import { ITask, ITaskAssignment } from '~/types/ITask';
import { EStateName } from '~/store/enums';
import {
  createGenericEntityAdapter,
  createEntityReducers,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
import { AddTasksPayload, ReplaceTasksFromServerPayload, UpdateTasksPayload } from './types';
import { ETaskStatus } from '~/types/ETask';
import { generateTasksForDate as buildTasksForDate } from '~/utils/tasks/taskGeneration';

export const tasksAdapter = createGenericEntityAdapter<ITask>();

const initialState: IStateTasks = {
  ...tasksAdapter.getInitialState(),
};

const entityReducers = createEntityReducers(tasksAdapter);

export const tasksSlice = createSlice({
  name: EStateName.tasks,
  initialState,
  reducers: {
    addTask: noopEntityRequestReducer,
    addTaskSuccess: (state, action: PayloadAction<ITask>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      });
    },
    updateTask: noopEntityRequestReducer,
    updateTaskSuccess: (state, action: PayloadAction<ITask>) => {
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<ITask>);
    },
    removeTask: noopEntityRequestReducer,
    removeTaskSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearTasks: state => {
      entityReducers.clearEntities(state);
    },
    replaceTasksFromServer: (
      state,
      action: PayloadAction<ReplaceTasksFromServerPayload>,
    ) => {
      const { tasks, from, to } = action.payload;
      const serverIds = new Set(tasks.map(task => task.id));

      if (tasks.length > 0) {
        tasksAdapter.upsertMany(state, tasks);
      }

      const stalePendingIds = (state.ids as string[]).filter(id => {
        const task = state.entities[id];

        if (!task || task.date < from || task.date > to) {
          return false;
        }

        return !serverIds.has(id) && task.status === ETaskStatus.Pending;
      });

      if (stalePendingIds.length > 0) {
        tasksAdapter.removeMany(state, stalePendingIds);
      }
    },
    generateTasksForDate: (
      state,
      action: PayloadAction<{ date: string; assignments: ITaskAssignment[] }>,
    ) => {
      const { date, assignments } = action.payload;
      const newTasks = buildTasksForDate(
        assignments,
        date,
        state.ids as string[],
      );

      if (newTasks.length > 0) {
        tasksAdapter.addMany(state, newTasks);
      }
    },
    addGeneratedTask: (state, action: PayloadAction<ITask>) => {
      if (!state.entities[action.payload.id]) {
        tasksAdapter.addOne(state, action.payload);
      }
    },
  },
});

export const {
  addTask,
  addTaskSuccess,
  updateTask,
  updateTaskSuccess,
  removeTask,
  removeTaskSuccess,
  clearTasks,
  replaceTasksFromServer,
  generateTasksForDate,
  addGeneratedTask,
} = tasksSlice.actions;

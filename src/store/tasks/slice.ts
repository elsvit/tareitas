import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStateTasks, RemoveTasksPayload } from './types';
import { ITask, ITaskAssignment } from '~/types/ITask';
import { EStateName } from '~/store/enums';
import {
  createGenericEntityAdapter,
  createEntityReducers,
} from '~/store/helpers';
import { AddTasksPayload, UpdateTasksPayload } from './types';
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
    addTask: (state, action: PayloadAction<AddTasksPayload>) => {
      entityReducers.addEntity(state, action);
    },
    addTaskSuccess: (state, action: PayloadAction<ITask>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      });
    },
    updateTask: (state, action: PayloadAction<UpdateTasksPayload>) => {
      entityReducers.upsertEntity(state, { ...action, payload: action.payload.entity });
    },
    updateTaskSuccess: (state, action: PayloadAction<ITask>) => {
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<ITask>);
    },
    removeTask: (state, action: PayloadAction<RemoveTasksPayload>) => {
      entityReducers.removeEntity(state, { ...action, payload: action.payload.entity });
    },
    removeTaskSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearTasks: state => {
      entityReducers.clearEntities(state);
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
  generateTasksForDate,
  addGeneratedTask,
} = tasksSlice.actions;

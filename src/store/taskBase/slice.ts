import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getBaseTasks } from '~/constants/tasks';
import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { ITaskBase } from '~/types/ITask';
import {
  AddTaskBasePayload,
  IStateTaskBase,
  RemoveTaskBasePayload,
  UpdateTaskBasePayload,
} from './types';

export const taskBaseAdapter = createGenericEntityAdapter<ITaskBase>();

export const getTaskBaseInitialState = (): IStateTaskBase =>
  taskBaseAdapter.setAll(taskBaseAdapter.getInitialState(), getBaseTasks());

const initialState: IStateTaskBase = getTaskBaseInitialState();

const entityReducers = createEntityReducers(taskBaseAdapter);

export const taskBaseSlice = createSlice({
  name: EStateName.taskBase,
  initialState,
  reducers: {
    addTaskBase: (state, action: PayloadAction<AddTaskBasePayload>) => {
      entityReducers.addEntity(state, action as unknown as PayloadAction<{ entity: ITaskBase; isUpsert?: boolean }>);
    },
    addTaskBaseSuccess: (state, action: PayloadAction<ITaskBase>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      } as unknown as PayloadAction<{ entity: ITaskBase; isUpsert?: boolean }>);
    },
    updateTaskBase: (state, action: PayloadAction<UpdateTaskBasePayload>) => {
      entityReducers.upsertEntity(
        state,
        { ...action, payload: action.payload.entity } as unknown as PayloadAction<ITaskBase>
      );
    },
    updateTaskBaseSuccess: (state, action: PayloadAction<ITaskBase>) => {
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<ITaskBase>);
    },
    removeTaskBase: (state, action: PayloadAction<RemoveTaskBasePayload>) => {
      entityReducers.removeEntity(
        state,
        { ...action, payload: action.payload.id } as unknown as PayloadAction<string>
      );
    },
    removeTaskBaseSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearTaskBase: state => {
      entityReducers.clearEntities(state);
    },
    resetTaskBase: state => {
      entityReducers.resetEntities(
        state,
        { payload: getBaseTasks() } as PayloadAction<ITaskBase[]>,
      );
    },
    syncTaskBaseTranslations: state => {
      getBaseTasks().forEach(defaultTask => {
        const existing = state.entities[defaultTask.id];

        if (!existing) {
          return;
        }

        existing.name = defaultTask.name;
        existing.description = defaultTask.description;
      });
    },
  },
});

export const {
  addTaskBase,
  addTaskBaseSuccess,
  updateTaskBase,
  updateTaskBaseSuccess,
  removeTaskBase,
  removeTaskBaseSuccess,
  clearTaskBase,
  resetTaskBase,
  syncTaskBaseTranslations,
} = taskBaseSlice.actions;

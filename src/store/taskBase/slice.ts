import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getBaseTasks } from '~/constants/tasks';
import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
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
    addTaskBase: noopEntityRequestReducer,
    addTaskBaseSuccess: (state, action: PayloadAction<ITaskBase>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      } as unknown as PayloadAction<{ entity: ITaskBase; isUpsert?: boolean }>);
    },
    updateTaskBase: noopEntityRequestReducer,
    updateTaskBaseSuccess: (state, action: PayloadAction<ITaskBase>) => {
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<ITaskBase>);
    },
    removeTaskBase: noopEntityRequestReducer,
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
          entityReducers.addEntity(
            state,
            {
              payload: { entity: defaultTask, isUpsert: false },
            } as PayloadAction<{ entity: ITaskBase; isUpsert?: boolean }>,
          );
          return;
        }

        existing.name = defaultTask.name;
        existing.description = defaultTask.description;

        if (defaultTask.color !== undefined) {
          existing.color = defaultTask.color;
        }

        if (defaultTask.reward != null) {
          existing.reward = defaultTask.reward;
        }

        if (defaultTask.time !== undefined) {
          existing.time = defaultTask.time;
        }

        if (defaultTask.subtasks !== undefined) {
          existing.subtasks = defaultTask.subtasks.map(subtask => ({ ...subtask }));
        } else {
          delete existing.subtasks;
        }
      });
    },
    replaceTaskBaseCatalog: (
      state,
      action: PayloadAction<ITaskBase[]>,
    ) => {
      taskBaseAdapter.setAll(state, action.payload);
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
  replaceTaskBaseCatalog,
} = taskBaseSlice.actions;

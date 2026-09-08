import { combineReducers, configureStore, Store } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import { Persistor } from 'redux-persist/lib/types';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

import { IS_WEB } from '~/constants';
import {
  modeAwareFamilyStorage,
  sharedPersistStorage,
} from '~/services/storage/familyPersistStorage';
import { childrenSlice, IStateChildren } from './children';
import childrenSagas from './children/sagas';
import { commonSlice } from './common/slice';
import { EStateName } from './enums';
import { IStateParents, parentsSlice } from './parents';
import parentsSagas from './parents/sagas';
import { IStateSettings, settingsSagas, settingsSlice } from './settings';
import { catalogSagas } from './catalog';
import rewardBaseSagas from './rewardBase/sagas';
import { IStateRewardBase, rewardBaseSlice } from './rewardBase';
import { IStateRewardAssignment, rewardAssignmentSlice } from './rewardAssignment';
import { IStateRewards, rewardsSlice } from './rewards';
import { normalizeEarnedRewardPeriods } from './rewards/rewardCalculations';
import { IStateTaskAssignment, taskAssignmentSlice } from './taskAssignment';
import taskAssignmentSagas from './taskAssignment/sagas';
import taskBaseSagas from './taskBase/sagas';
import { IStateTaskBase, taskBaseSlice } from './taskBase';
import tasksSagas from './tasks/sagas';
import rewardAssignmentSagas from './rewardAssignment/sagas';
import rewardsSagas from './rewards/sagas';
import { IStateImages, imagesSlice } from './images';
import imagesSagas from './images/sagas';
import { IStateTasks, tasksSlice } from './tasks';
import type { IState } from './types';

function* rootSaga() {
  yield all([
    ...parentsSagas,
    ...childrenSagas,
    ...tasksSagas,
    ...taskAssignmentSagas,
    ...rewardAssignmentSagas,
    ...rewardsSagas,
    ...taskBaseSagas,
    ...rewardBaseSagas,
    ...settingsSagas,
    ...catalogSagas,
    ...imagesSagas,
  ]);
}

function buildRewardsMigrate(): PersistConfig<IStateRewards>['migrate'] {
  return (state => {
    const rewards = state as IStateRewards | undefined;

    if (rewards?.earnedRewardPeriods) {
      return Promise.resolve({
        ...(state as object),
        ...rewards,
        earnedRewardPeriods: normalizeEarnedRewardPeriods(
          rewards.earnedRewardPeriods,
        ),
      });
    }

    return Promise.resolve(state);
  }) as PersistConfig<IStateRewards>['migrate'];
}

function buildPersistedReducers() {
  const familyStorage = modeAwareFamilyStorage;

  const settingsPersistConfig: PersistConfig<IStateSettings> = {
    key: EStateName.settings,
    storage: sharedPersistStorage,
    stateReconciler: autoMergeLevel2,
  };

  const parentsPersistConfig: PersistConfig<IStateParents> = {
    key: EStateName.parents,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const childrenPersistConfig: PersistConfig<IStateChildren> = {
    key: EStateName.children,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const imagesPersistConfig: PersistConfig<IStateImages> = {
    key: EStateName.images,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const tasksPersistConfig: PersistConfig<IStateTasks> = {
    key: EStateName.tasks,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const taskBasePersistConfig: PersistConfig<IStateTaskBase> = {
    key: EStateName.taskBase,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const rewardBasePersistConfig: PersistConfig<IStateRewardBase> = {
    key: EStateName.rewardBase,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const taskAssignmentPersistConfig: PersistConfig<IStateTaskAssignment> = {
    key: EStateName.taskAssignment,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const rewardAssignmentPersistConfig: PersistConfig<IStateRewardAssignment> = {
    key: EStateName.rewardAssignment,
    storage: familyStorage,
    stateReconciler: hardSet,
  };

  const rewardsPersistConfig: PersistConfig<IStateRewards> = {
    key: EStateName.rewards,
    storage: familyStorage,
    stateReconciler: hardSet,
    version: 2,
    migrate: buildRewardsMigrate(),
  };

  const settingsReducer = IS_WEB
    ? settingsSlice.reducer
    : persistReducer<IStateSettings>(
        settingsPersistConfig,
        settingsSlice.reducer,
      );

  const parentsReducer = IS_WEB
    ? parentsSlice.reducer
    : persistReducer<IStateParents>(
        parentsPersistConfig,
        parentsSlice.reducer,
      );

  const childrenReducer = IS_WEB
    ? childrenSlice.reducer
    : persistReducer<IStateChildren>(
        childrenPersistConfig,
        childrenSlice.reducer,
      );

  const imagesReducer = IS_WEB
    ? imagesSlice.reducer
    : persistReducer<IStateImages>(
        imagesPersistConfig,
        imagesSlice.reducer,
      );

  const tasksReducer = IS_WEB
    ? tasksSlice.reducer
    : persistReducer<IStateTasks>(tasksPersistConfig, tasksSlice.reducer);

  const taskBaseReducer = IS_WEB
    ? taskBaseSlice.reducer
    : persistReducer<IStateTaskBase>(
        taskBasePersistConfig,
        taskBaseSlice.reducer,
      );

  const rewardBaseReducer = IS_WEB
    ? rewardBaseSlice.reducer
    : persistReducer<IStateRewardBase>(
        rewardBasePersistConfig,
        rewardBaseSlice.reducer,
      );

  const taskAssignmentReducer = IS_WEB
    ? taskAssignmentSlice.reducer
    : persistReducer<IStateTaskAssignment>(
        taskAssignmentPersistConfig,
        taskAssignmentSlice.reducer,
      );

  const rewardAssignmentReducer = IS_WEB
    ? rewardAssignmentSlice.reducer
    : persistReducer<IStateRewardAssignment>(
        rewardAssignmentPersistConfig,
        rewardAssignmentSlice.reducer,
      );

  const rewardsReducer = IS_WEB
    ? rewardsSlice.reducer
    : persistReducer<IStateRewards>(
        rewardsPersistConfig,
        rewardsSlice.reducer,
      );

  return combineReducers({
    [EStateName.common]: commonSlice.reducer,
    [EStateName.settings]: settingsReducer,
    [EStateName.parents]: parentsReducer,
    [EStateName.children]: childrenReducer,
    [EStateName.tasks]: tasksReducer,
    [EStateName.taskBase]: taskBaseReducer,
    [EStateName.rewardBase]: rewardBaseReducer,
    [EStateName.taskAssignment]: taskAssignmentReducer,
    [EStateName.rewardAssignment]: rewardAssignmentReducer,
    [EStateName.rewards]: rewardsReducer,
    [EStateName.images]: imagesReducer,
  });
}

const sagaMiddleware = createSagaMiddleware();
let sagasStarted = false;

type AppStore = Store<IState>;

function configureAppStore(): AppStore {
  return configureStore({
    reducer: buildPersistedReducers(),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PAUSE',
            'persist/FLUSH',
            'persist/PURGE',
            'persist/REGISTER',
          ],
          ignoredActionPaths: ['payload.onSuccess'],
        },
      }).concat(__DEV__ ? [sagaMiddleware, logger] : [sagaMiddleware]),
    devTools: __DEV__,
  });
}

function startSagasOnce() {
  if (!sagasStarted) {
    sagaMiddleware.run(rootSaga);
    sagasStarted = true;
  }
}

export let store: AppStore = configureAppStore();
export let persistor: Persistor | null = IS_WEB
  ? null
  : persistStore(store);

startSagasOnce();

export function createAppStore() {
  store = configureAppStore();
  persistor = IS_WEB ? null : persistStore(store);
  startSagasOnce();
  return { store, persistor };
}

export type RootStateT = IState;
export type AppDispatch = AppStore['dispatch'];

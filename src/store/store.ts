import { combineReducers, configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import { Persistor } from 'redux-persist/lib/types';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

import { IS_WEB } from '~/constants';
import { getStorage } from '~/services/storage/storage';
import { childrenSlice, IStateChildren } from './children';
import { commonSlice } from './common/slice';
import { EStateName } from './enums';
import { IStateParents, parentsSlice } from './parents';
import { IStateSettings, settingsSagas, settingsSlice } from './settings';
import { IStateRewardBase, rewardBaseSlice } from './rewardBase';
import { IStateRewardAssignment, rewardAssignmentSlice } from './rewardAssignment';
import { IStateRewards, rewardsSlice } from './rewards';
import { normalizeEarnedRewardPeriods } from './rewards/rewardCalculations';
import { IStateTaskAssignment, taskAssignmentSlice } from './taskAssignment';
import { IStateTaskBase, taskBaseSlice } from './taskBase';
import { IStateImages, imagesSlice } from './images';
import { IStateTasks, tasksSlice } from './tasks';

// Root saga
function* rootSaga() {
  yield all([
    // ...parentsSagas,
    // ...childrenSagas,
    ...settingsSagas,
  ]);
}

// Storage selection
const storage = getStorage()

// Persist configs
const settingsPersistConfig: PersistConfig<IStateSettings> = {
  key: EStateName.settings,
  storage,
  stateReconciler: autoMergeLevel2,
  // whitelist: ['lang'],
};

const parentsPersistConfig: PersistConfig<IStateParents> = {
  key: EStateName.parents,
  storage,
  stateReconciler: autoMergeLevel2,
  // whitelist: ['entities', 'ids'],
};

const childrenPersistConfig: PersistConfig<IStateChildren> = {
  key: EStateName.children,
  storage,
  stateReconciler: autoMergeLevel2,
  // whitelist: ['entities', 'ids'],
};

const imagesPersistConfig: PersistConfig<IStateImages> = {
  key: EStateName.images,
  storage,
  stateReconciler: autoMergeLevel2,
};

const tasksPersistConfig: PersistConfig<IStateTasks> = {
  key: EStateName.tasks,
  storage,
  stateReconciler: autoMergeLevel2,
  // whitelist: ['entities', 'ids'],
};

const taskBasePersistConfig: PersistConfig<IStateTaskBase> = {
  key: EStateName.taskBase,
  storage,
  stateReconciler: hardSet,
  // whitelist: ['entities'],
};

const rewardBasePersistConfig: PersistConfig<IStateRewardBase> = {
  key: EStateName.rewardBase,
  storage,
  stateReconciler: hardSet,
  // whitelist: ['entities'],
};

const taskAssignmentPersistConfig: PersistConfig<IStateTaskAssignment> = {
  key: EStateName.taskAssignment,
  storage,
  stateReconciler: autoMergeLevel2,
  // whitelist: ['entities'],
};

const rewardAssignmentPersistConfig: PersistConfig<IStateRewardAssignment> = {
  key: EStateName.rewardAssignment,
  storage,
  stateReconciler: autoMergeLevel2,
};

const rewardsPersistConfig: PersistConfig<IStateRewards> = {
  key: EStateName.rewards,
  storage,
  stateReconciler: autoMergeLevel2,
  version: 2,
  migrate: (state => {
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
  }) as PersistConfig<IStateRewards>['migrate'],
};

// Combine reducers
const settingsReducer = IS_WEB
  ? settingsSlice.reducer
  : persistReducer<IStateSettings>(settingsPersistConfig, settingsSlice.reducer);

const parentsReducer = IS_WEB
  ? parentsSlice.reducer
  : persistReducer<IStateParents>(parentsPersistConfig, parentsSlice.reducer);

const childrenReducer = IS_WEB
  ? childrenSlice.reducer
  : persistReducer<IStateChildren>(childrenPersistConfig, childrenSlice.reducer);

const imagesReducer = IS_WEB
  ? imagesSlice.reducer
  : persistReducer<IStateImages>(imagesPersistConfig, imagesSlice.reducer);

const tasksReducer = IS_WEB
  ? tasksSlice.reducer
  : persistReducer<IStateTasks>(tasksPersistConfig, tasksSlice.reducer);

const taskBaseReducer = IS_WEB
  ? taskBaseSlice.reducer
  : persistReducer<IStateTaskBase>(taskBasePersistConfig, taskBaseSlice.reducer);

const rewardBaseReducer = IS_WEB
  ? rewardBaseSlice.reducer
  : persistReducer<IStateRewardBase>(rewardBasePersistConfig, rewardBaseSlice.reducer);

const taskAssignmentReducer = IS_WEB
  ? taskAssignmentSlice.reducer
  : persistReducer<IStateTaskAssignment>(
      taskAssignmentPersistConfig,
      taskAssignmentSlice.reducer
    );

const rewardAssignmentReducer = IS_WEB
  ? rewardAssignmentSlice.reducer
  : persistReducer<IStateRewardAssignment>(
      rewardAssignmentPersistConfig,
      rewardAssignmentSlice.reducer
    );

const rewardsReducer = IS_WEB
  ? rewardsSlice.reducer
  : persistReducer<IStateRewards>(rewardsPersistConfig, rewardsSlice.reducer);

const rootReducer = combineReducers({
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

// Saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store once
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
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
      },
    }).concat(__DEV__ ? [sagaMiddleware, logger] : [sagaMiddleware]),
  devTools: __DEV__,
});

sagaMiddleware.run(rootSaga);

// export const persistor: Persistor = persistStore(store);
export const persistor: Persistor | null = IS_WEB ? null : persistStore(store);

// Types
export type RootStateT = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

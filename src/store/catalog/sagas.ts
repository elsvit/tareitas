import { call, put, select } from 'redux-saga/effects';

import {
  BUNDLED_REWARD_CATALOG_VERSION,
  BUNDLED_TASK_CATALOG_VERSION,
} from '~/constants/catalog';
import {
  fetchFamilyCatalog,
  syncFamilyCatalog,
} from '~/services/api';
import { selectAllRewardBase } from '~/store/rewardBase/selectors';
import { replaceRewardBaseCatalog } from '~/store/rewardBase/slice';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { replaceTaskBaseCatalog } from '~/store/taskBase/slice';
import { takeLatestWithFetchable } from '~/store/helpers/fetchableHandler';
import {
  clearCatalogDirty,
  setCatalogRevisions,
  syncCatalog,
} from '~/store/settings/slice';
import {
  selectAuthToken,
  selectCatalogDirty,
  selectFamilyId,
  selectIsMultidevice,
  selectLastSyncedRewardBaseRevision,
  selectLastSyncedTaskBaseRevision,
  selectPendingRemovedRewardBaseIds,
  selectPendingRemovedTaskBaseIds,
} from '~/store/settings/selectors';
import { IFamilyCatalog } from '~/types/ICatalog';
import type { ITaskBase } from '~/types/ITask';
import type { IRewardBase } from '~/types/IReward';

import {
  mapCatalogRewardBaseToLocal,
  mapCatalogTaskBaseToLocal,
  toRewardBaseSyncItem,
  toTaskBaseSyncItem,
} from './catalogMappers';
import {
  resolveAndCacheRewardPicture,
  resolveAndCacheTaskPicture,
} from '~/store/helpers/imageRefSync';
import {
  assertMultideviceSession,
} from '~/store/helpers/multideviceSession';

function* applyCatalogFromServer(catalog: IFamilyCatalog) {
  yield put(
    replaceTaskBaseCatalog(
      mapCatalogTaskBaseToLocal(catalog.taskBase),
    ),
  );
  yield put(
    replaceRewardBaseCatalog(
      mapCatalogRewardBaseToLocal(catalog.rewardBase),
    ),
  );
  yield put(
    setCatalogRevisions({
      taskBaseRevision: catalog.taskBaseRevision,
      rewardBaseRevision: catalog.rewardBaseRevision,
    }),
  );
}

function* syncCatalogSaga(): Generator<any, void, any> {
  const isMultidevice: boolean = yield select(
    selectIsMultidevice,
  );

  if (!isMultidevice) {
    return;
  }

  const familyId: string | null = yield select(
    selectFamilyId,
  );
  const authToken: string | null = yield select(
    selectAuthToken,
  );

  if (!familyId || !authToken) {
    return;
  }

  const taskRevision: number = yield select(
    selectLastSyncedTaskBaseRevision,
  );
  const rewardRevision: number = yield select(
    selectLastSyncedRewardBaseRevision,
  );

  let serverCatalog: IFamilyCatalog | null = null;

  try {
    serverCatalog = yield call(
      fetchFamilyCatalog,
      familyId,
      authToken,
      {
        taskRevision,
        rewardRevision,
      },
    );
  } catch {
    serverCatalog = null;
  }

  if (serverCatalog) {
    yield call(applyCatalogFromServer, serverCatalog);
  }

  const catalogDirty: boolean = yield select(
    selectCatalogDirty,
  );
  const serverBundledTaskVersion =
    serverCatalog?.bundledTaskCatalogVersion ?? 0;
  const serverBundledRewardVersion =
    serverCatalog?.bundledRewardCatalogVersion ?? 0;

  const shouldPushTasks =
    catalogDirty ||
    BUNDLED_TASK_CATALOG_VERSION >
      serverBundledTaskVersion;
  const shouldPushRewards =
    catalogDirty ||
    BUNDLED_REWARD_CATALOG_VERSION >
      serverBundledRewardVersion;

  if (!shouldPushTasks && !shouldPushRewards) {
    return;
  }

  const session = yield* assertMultideviceSession();

  let taskBase: ITaskBase[] = yield select(
    selectAllTaskBase,
  );
  let rewardBase: IRewardBase[] = yield select(
    selectAllRewardBase,
  );

  if (session && shouldPushTasks) {
    taskBase = [];

    for (const item of yield select(selectAllTaskBase)) {
      if (!item.picture) {
        taskBase.push(item);
        continue;
      }

      const resolvedPicture: string | undefined = yield call(
        resolveAndCacheTaskPicture,
        item.picture,
        session.familyId,
      );

      taskBase.push({
        ...item,
        picture: resolvedPicture ?? item.picture,
      });
    }
  }

  if (session && shouldPushRewards) {
    rewardBase = [];

    for (const item of yield select(selectAllRewardBase)) {
      if (!item.picture) {
        rewardBase.push(item);
        continue;
      }

      const resolvedPicture: string | undefined = yield call(
        resolveAndCacheRewardPicture,
        item.picture,
        session.familyId,
      );

      rewardBase.push({
        ...item,
        picture: resolvedPicture ?? item.picture,
      });
    }
  }

  const removedTaskBaseIds: string[] = yield select(
    selectPendingRemovedTaskBaseIds,
  );
  const removedRewardBaseIds: string[] = yield select(
    selectPendingRemovedRewardBaseIds,
  );

  const syncedCatalog: IFamilyCatalog = yield call(
    syncFamilyCatalog,
    familyId,
    authToken,
    {
      bundledTaskCatalogVersion: shouldPushTasks
        ? BUNDLED_TASK_CATALOG_VERSION
        : undefined,
      bundledRewardCatalogVersion: shouldPushRewards
        ? BUNDLED_REWARD_CATALOG_VERSION
        : undefined,
      clientTaskRevision: taskRevision,
      clientRewardRevision: rewardRevision,
      taskBase: shouldPushTasks
        ? taskBase.map(toTaskBaseSyncItem)
        : undefined,
      rewardBase: shouldPushRewards
        ? rewardBase.map(toRewardBaseSyncItem)
        : undefined,
      removedTaskBaseIds: shouldPushTasks
        ? removedTaskBaseIds
        : undefined,
      removedRewardBaseIds: shouldPushRewards
        ? removedRewardBaseIds
        : undefined,
    },
  );

  yield call(applyCatalogFromServer, syncedCatalog);
  yield put(clearCatalogDirty());
}

export { syncCatalogSaga };

export default [
  takeLatestWithFetchable(syncCatalog, syncCatalogSaga),
];

import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';

import { FAMILY_PERSIST_KEYS } from '~/services/storage/familyPersistStorage';
import { EStateName } from '~/store/enums';
import { hydrateFromStorage as hydrateChildrenFromStorage } from '~/store/children/slice';
import { hydrateFromStorage as hydrateImagesFromStorage } from '~/store/images/slice';
import { hydrateFromStorage as hydrateParentsFromStorage } from '~/store/parents/slice';
import { hydrateFromStorage as hydrateRewardAssignmentFromStorage } from '~/store/rewardAssignment/slice';
import { hydrateFromStorage as hydrateRewardBaseFromStorage } from '~/store/rewardBase/slice';
import { hydrateFromStorage as hydrateRewardsFromStorage } from '~/store/rewards/slice';
import { hydrateFromStorage as hydrateTaskAssignmentFromStorage } from '~/store/taskAssignment/slice';
import { hydrateFromStorage as hydrateTaskBaseFromStorage } from '~/store/taskBase/slice';
import { hydrateFromStorage as hydrateTasksFromStorage } from '~/store/tasks/slice';
import type { AppDispatch } from '~/store/store';

type FamilyPersistKey = (typeof FAMILY_PERSIST_KEYS)[number];
type HydrateActionCreator = ActionCreatorWithPayload<unknown>;

const FAMILY_SLICE_HYDRATORS: Partial<
  Record<FamilyPersistKey, HydrateActionCreator>
> = {
  [EStateName.parents]: hydrateParentsFromStorage as HydrateActionCreator,
  [EStateName.children]: hydrateChildrenFromStorage as HydrateActionCreator,
  [EStateName.tasks]: hydrateTasksFromStorage as HydrateActionCreator,
  [EStateName.taskBase]: hydrateTaskBaseFromStorage as HydrateActionCreator,
  [EStateName.rewardBase]: hydrateRewardBaseFromStorage as HydrateActionCreator,
  [EStateName.taskAssignment]:
    hydrateTaskAssignmentFromStorage as HydrateActionCreator,
  [EStateName.rewardAssignment]:
    hydrateRewardAssignmentFromStorage as HydrateActionCreator,
  [EStateName.rewards]: hydrateRewardsFromStorage as HydrateActionCreator,
  [EStateName.images]: hydrateImagesFromStorage as HydrateActionCreator,
};

export function dispatchFamilySliceHydrate(
  dispatch: AppDispatch,
  key: FamilyPersistKey,
  payload: unknown,
): boolean {
  const hydrate = FAMILY_SLICE_HYDRATORS[key];

  if (!hydrate) {
    return false;
  }

  dispatch(hydrate(payload));

  return true;
}

import type { Middleware } from '@reduxjs/toolkit';

import { scheduleFamilySnapshot } from '~/services/familyPersistMode';
import { FAMILY_PERSIST_KEYS } from '~/services/storage/familyPersistStorage';

import { EStateName } from './enums';

const FAMILY_SLICE_NAMES = new Set<string>(FAMILY_PERSIST_KEYS);

const EXTRA_FAMILY_PERSIST_ACTIONS = new Set([
  `${EStateName.tasks}/generateTasksForDate`,
  `${EStateName.tasks}/addGeneratedTask`,
  `${EStateName.taskBase}/syncTaskBaseTranslations`,
  `${EStateName.rewardBase}/syncRewardBaseTranslations`,
  `${EStateName.rewards}/syncEarnedRewardPeriods`,
  `${EStateName.images}/setTaskImageUrl`,
  `${EStateName.images}/setRewardImageUrl`,
  `${EStateName.images}/setUserImageUrl`,
  `${EStateName.images}/removeTaskImageUrl`,
  `${EStateName.images}/removeRewardImageUrl`,
  `${EStateName.images}/removeUserImageUrl`,
]);

export function shouldPersistFamilySnapshot(actionType: string): boolean {
  if (EXTRA_FAMILY_PERSIST_ACTIONS.has(actionType)) {
    return true;
  }

  const slash = actionType.indexOf('/');

  if (slash === -1) {
    return false;
  }

  const slice = actionType.slice(0, slash);
  const name = actionType.slice(slash + 1);

  if (!FAMILY_SLICE_NAMES.has(slice)) {
    return false;
  }

  return name.endsWith('Success');
}

export const familySnapshotMiddleware: Middleware =
  storeApi => next => action => {
    const result = next(action);

    if (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      shouldPersistFamilySnapshot(String(action.type))
    ) {
      scheduleFamilySnapshot(storeApi.getState);
    }

    return result;
  };

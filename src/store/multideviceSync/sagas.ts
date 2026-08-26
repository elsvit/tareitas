import { call, put, select } from 'redux-saga/effects';
import { addDays, format, parseISO, subDays } from 'date-fns';

import {
  listTaskAssignments,
  mapServerTaskAssignmentToLocal,
} from '~/services/api/taskAssignmentsApi';
import {
  listTaskInstances,
  mapServerTaskToLocal,
} from '~/services/api/tasksApi';
import {
  listFamilyRewards,
  listRewardRedemptions,
  completeRewardRedemption,
  mapServerFamilyRewardToAssignment,
  mapServerRedemptionToLocal,
  ServerRewardRedemption,
  ServerRewardRedemptionStatus,
} from '~/services/api/rewardsApi';
import { fetchFamilyDetails } from '~/services/api';
import { buildFamilyMembersSyncPlan } from '~/services/familySync';
import { resolveAndCacheRewardPicture, resolveAndCacheTaskPicture } from '~/store/helpers/imageRefSync';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { selectCanReviewTasks } from '~/store/settings/selectors';
import {
  addChildSuccess,
  removeChildSuccess,
  updateChildSuccess,
} from '~/store/children/slice';
import {
  addParentSuccess,
  removeParentSuccess,
  updateParentSuccess,
} from '~/store/parents/slice';
import { selectAllChildren, selectDedupedChildIds } from '~/store/children/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { replaceRewardAssignments, remapRewardAssignmentChildIds } from '~/store/rewardAssignment/slice';
import { mapServerChildUserIdsToChildIds } from '~/store/rewardAssignment/childIds';
import { inferRewardAssignmentPicture } from '~/store/rewardAssignment/rewardAssignmentPicture';
import { selectAllRewardBase } from '~/store/rewardBase/selectors';
import { replaceRewardInstancesFromServer } from '~/store/rewards/slice';
import { replaceTaskAssignments } from '~/store/taskAssignment/slice';
import { replaceTasksFromServer } from '~/store/tasks/slice';
import type { IState } from '~/store/types';
import { IReward } from '~/types/IReward';
import {
  selectCurrentUser,
  selectHasAuthSession,
  selectTaskCalendarDate,
} from '~/store/settings/selectors';

function findLocalCompletedRedemption(
  localEntities: Record<string, IReward | undefined>,
  serverRedemption: ServerRewardRedemption,
): IReward | undefined {
  const byId = localEntities[serverRedemption.id];

  if (byId?.completedDate) {
    return byId;
  }

  return Object.values(localEntities).find(
    (reward): reward is IReward =>
      !!reward &&
      reward.rewardAssignmentId === serverRedemption.rewardId &&
      reward.childId === serverRedemption.childUserId &&
      !!reward.completedDate,
  );
}

function resolveReconciledRedemption(
  localEntities: Record<string, IReward | undefined>,
  serverRedemption: ServerRewardRedemption,
): IReward {
  const localCompleted = findLocalCompletedRedemption(
    localEntities,
    serverRedemption,
  );
  const mapped = mapServerRedemptionToLocal(serverRedemption);

  return {
    ...mapped,
    completedDate: mapped.completedDate ?? localCompleted?.completedDate,
  };
}

function* resolveAssignmentPictures(
  assignments: ReturnType<typeof mapServerTaskAssignmentToLocal>[],
  familyId: string,
) {
  const resolved = [];

  for (const assignment of assignments) {
    if (!assignment.picture) {
      resolved.push(assignment);
      continue;
    }

    const picture: string | undefined = yield call(
      resolveAndCacheTaskPicture,
      assignment.picture,
      familyId,
    );

    resolved.push({
      ...assignment,
      picture: picture ?? assignment.picture,
    });
  }

  return resolved;
}

function* resolveRewardAssignmentPictures(
  assignments: ReturnType<typeof mapServerFamilyRewardToAssignment>[],
  familyId: string,
) {
  const resolved = [];

  for (const assignment of assignments) {
    if (!assignment.picture) {
      resolved.push(assignment);
      continue;
    }

    const picture: string | undefined = yield call(
      resolveAndCacheRewardPicture,
      assignment.picture,
      familyId,
    );

    resolved.push({
      ...assignment,
      picture: picture ?? assignment.picture,
    });
  }

  return resolved;
}

export function* syncTaskAssignmentsFromServerSaga(): Generator<
  any,
  void,
  any
> {
  const session = yield* assertMultideviceSession();

  if (!session) {
    return;
  }

  const selectedDate: string = yield select(selectTaskCalendarDate);
  const anchorDate = parseISO(selectedDate);
  const from = format(subDays(anchorDate, 60), 'yyyy-MM-dd');
  const to = format(addDays(anchorDate, 14), 'yyyy-MM-dd');

  const [serverAssignments, serverTasks] = yield* callMultideviceApi(
    async token => {
      const assignments = await listTaskAssignments(
        token,
        session.familyId,
      );
      const tasks = await listTaskInstances(
        token,
        session.familyId,
        { from, to },
      );

      return [assignments, tasks] as const;
    },
  );

  const localAssignments = serverAssignments.map(
    mapServerTaskAssignmentToLocal,
  );
  const assignmentsWithPictures: typeof localAssignments = yield call(
    resolveAssignmentPictures,
    localAssignments,
    session.familyId,
  );

  yield put(replaceTaskAssignments(assignmentsWithPictures));
  yield put(
    replaceTasksFromServer({
      tasks: serverTasks.map(mapServerTaskToLocal),
      from,
      to,
    }),
  );
}

export function* syncRewardsDataFromServerSaga(): Generator<
  any,
  void,
  any
> {
  const session = yield* assertMultideviceSession();

  if (!session) {
    return;
  }

  const [serverRewards, serverRedemptions] = yield* callMultideviceApi(
    async token => {
      const rewards = await listFamilyRewards(
        token,
        session.familyId,
      );
      const redemptions = await listRewardRedemptions(
        token,
        session.familyId,
      );

      return [rewards, redemptions] as const;
    },
  );

  const state: IState = yield select(
    (currentState: IState) => currentState,
  );
  const existingAssignments = state.rewardAssignment.entities;
  const canReviewRewards: boolean = yield select(selectCanReviewTasks);
  const localRewardEntities = state.rewards.entities;
  const rewardBase = selectAllRewardBase(state);
  const children = selectAllChildren(state);
  const validChildIds = selectDedupedChildIds(state);

  let reconciledRedemptions = serverRedemptions;

  if (canReviewRewards) {
    reconciledRedemptions = [];

    for (const serverRedemption of serverRedemptions) {
      const localCompleted = findLocalCompletedRedemption(
        localRewardEntities,
        serverRedemption,
      );

      if (
        localCompleted?.completedDate &&
        !serverRedemption.completedAt &&
        serverRedemption.status === ServerRewardRedemptionStatus.approved
      ) {
        try {
          const updated = yield* callMultideviceApi(token =>
            completeRewardRedemption(
              token,
              session.familyId,
              serverRedemption.id,
            ),
          );

          reconciledRedemptions.push(updated);
          continue;
        } catch {
          // Keep server snapshot when backfill fails; merge preserves completedDate.
        }
      }

      reconciledRedemptions.push(serverRedemption);
    }
  }

  const reconciledRewards = reconciledRedemptions.map(serverRedemption =>
    resolveReconciledRedemption(
      localRewardEntities,
      serverRedemption,
    ),
  );

  const assignments = serverRewards.map(serverReward => {
    const existing = existingAssignments[serverReward.id];
    const mapped = mapServerFamilyRewardToAssignment(serverReward);
    const childIds = mapServerChildUserIdsToChildIds(
      serverReward.childUserIds,
      validChildIds,
    );

    return {
      ...(existing ?? {}),
      ...mapped,
      picture: inferRewardAssignmentPicture(
        {
          title: mapped.title,
          picture: existing?.picture,
        },
        rewardBase,
      ),
      childIds,
    };
  });

  const assignmentsWithPictures: typeof assignments = yield call(
    resolveRewardAssignmentPictures,
    assignments,
    session.familyId,
  );

  yield put(replaceRewardAssignments(assignmentsWithPictures));
  yield put(replaceRewardInstancesFromServer(reconciledRewards));
}

export function* syncFamilyMembersFromServerSaga(): Generator<
  any,
  void,
  any
> {
  const session = yield* assertMultideviceSession();

  if (!session) {
    return;
  }

  const family = yield* callMultideviceApi(token =>
    fetchFamilyDetails(token, session.familyId),
  );
  const currentUser: string | null = yield select(selectCurrentUser);
  const state: IState = yield select(
    (currentState: IState) => currentState,
  );
  const adminUserId =
    family.parents.find(
      (parent: { role: string }) => parent.role === 'admin',
    )?.userId ?? currentUser ?? '';

  const existingChildren = selectAllChildren(state);

  const plan = buildFamilyMembersSyncPlan(
    family,
    adminUserId,
    selectAllParents(state),
    existingChildren,
  );

  for (const removedChildId of plan.removeChildIds) {
    const removedChild = existingChildren.find(
      child => child.id === removedChildId,
    );

    if (!removedChild) {
      continue;
    }

    const replacement = plan.children.find(
      child =>
        child.name.trim().toLowerCase() ===
        removedChild.name.trim().toLowerCase(),
    );

    if (replacement) {
      yield put(
        remapRewardAssignmentChildIds({
          fromId: removedChildId,
          toId: replacement.id,
        }),
      );
    }
  }

  for (const parentId of plan.removeParentIds) {
    yield put(removeParentSuccess(parentId));
  }

  for (const childId of plan.removeChildIds) {
    yield put(removeChildSuccess(childId));
  }

  for (const parent of plan.parents) {
    const existing = selectAllParents(state).find(
      item => item.id === parent.id,
    );

    if (existing) {
      yield put(updateParentSuccess(parent));
    } else {
      yield put(addParentSuccess(parent));
    }
  }

  for (const child of plan.children) {
    const existing = selectAllChildren(state).find(
      item => item.id === child.id,
    );

    if (existing) {
      yield put(updateChildSuccess(child));
    } else {
      yield put(addChildSuccess(child));
    }
  }
}

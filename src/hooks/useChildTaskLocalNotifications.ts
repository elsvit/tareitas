import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';

import {
  NOTIFICATION_PERMISSION_DEFER_MS,
  NOTIFICATION_SYNC_DEBOUNCE_MS,
} from '~/constants/localNotifications';
import {
  buildChildLocalNotificationTasks,
  cancelLocalNotificationsForAssignmentId,
  isLocalNotificationEnabled,
  syncChildTaskLocalNotifications,
} from '~/services/localNotifications/childTaskLocalNotifications';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  selectDeliveredChildTaskLocalNotificationIds,
  selectThisDeviceUsers,
} from '~/store/settings/selectors';

type Props = {
  childId: string | null;
  enabled: boolean;
};

export function useChildTaskLocalNotifications({
  childId,
  enabled,
}: Props) {
  const assignments = useSelector(selectAllTaskAssignment);
  const thisDeviceUsers = useSelector(selectThisDeviceUsers);
  const deliveredNotificationIds = useSelector(
    selectDeliveredChildTaskLocalNotificationIds,
  );
  const deliveredNotificationIdSet = useMemo(
    () => new Set(deliveredNotificationIds),
    [deliveredNotificationIds],
  );
  const previousAssignmentIdsRef = useRef<Set<string>>(new Set());
  const hasScheduledInitialSyncRef = useRef(false);

  useEffect(() => {
    hasScheduledInitialSyncRef.current = false;
  }, [childId]);

  const notificationTasks = useMemo(() => {
    if (!childId) {
      return [];
    }

    return buildChildLocalNotificationTasks(assignments, childId);
  }, [assignments, childId]);

  const runSync = useCallback(async () => {
    if (!enabled || !childId) {
      return;
    }

    const currentAssignmentIds = new Set(
      assignments
        .filter(assignment => assignment.childId === childId)
        .map(assignment => assignment.id),
    );

    const removedAssignmentIds = [...previousAssignmentIdsRef.current].filter(
      id => !currentAssignmentIds.has(id),
    );

    previousAssignmentIdsRef.current = currentAssignmentIds;

    for (const assignmentId of removedAssignmentIds) {
      await cancelLocalNotificationsForAssignmentId(assignmentId, childId);
    }

    for (const assignment of assignments) {
      if (
        assignment.childId === childId &&
        !isLocalNotificationEnabled(
          assignment.localNotificationBeforeMinutes,
        )
      ) {
        await cancelLocalNotificationsForAssignmentId(
          assignment.id,
          childId,
        );
      }
    }

    await syncChildTaskLocalNotifications({
      childId,
      thisDeviceUsers,
      deliveredNotificationIds: deliveredNotificationIdSet,
      tasks: notificationTasks,
    });
  }, [
    assignments,
    childId,
    deliveredNotificationIdSet,
    enabled,
    notificationTasks,
    thisDeviceUsers,
  ]);

  const runSyncRef = useRef(runSync);
  runSyncRef.current = runSync;

  useEffect(() => {
    if (!enabled || !childId) {
      hasScheduledInitialSyncRef.current = false;
      return;
    }

    if (hasScheduledInitialSyncRef.current) {
      return;
    }

    hasScheduledInitialSyncRef.current = true;

    const deferTimer = setTimeout(() => {
      void runSyncRef.current();
    }, NOTIFICATION_PERMISSION_DEFER_MS);

    return () => {
      clearTimeout(deferTimer);
    };
  }, [childId, enabled]);

  useEffect(() => {
    if (!enabled || !childId) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      void runSyncRef.current();
    }, NOTIFICATION_SYNC_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [
    childId,
    deliveredNotificationIdSet,
    enabled,
    notificationTasks,
    thisDeviceUsers,
  ]);

  useEffect(() => {
    if (!enabled || !childId) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void runSyncRef.current();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [childId, enabled]);
}

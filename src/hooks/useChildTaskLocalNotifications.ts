import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { NOTIFICATION_PERMISSION_DEFER_MS } from '~/constants/localNotifications';
import {
  cancelLocalNotificationsForAssignmentId,
  isLocalNotificationEnabled,
  syncChildTaskLocalNotifications,
  type ChildTaskNotificationInput,
} from '~/services/localNotifications/childTaskLocalNotifications';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  selectDeliveredChildTaskLocalNotificationIds,
  selectThisDeviceUsers,
} from '~/store/settings/selectors';
import {
  selectScheduledTasksForDate,
} from '~/store/tasks/selectors';
import { getAssignmentFieldsForDate } from '~/utils/tasks/recurringTaskEdit';
type Props = {
  childId: string | null;
  selectedDate: string;
  enabled: boolean;
};

export function useChildTaskLocalNotifications({
  childId,
  selectedDate,
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
  const scheduledItems = useSelector(
    selectScheduledTasksForDate(selectedDate, childId),
  );
  const previousAssignmentIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !childId) {
      return;
    }

    async function runSync() {
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

      const tasks: ChildTaskNotificationInput[] = [];

      for (const item of scheduledItems) {
        const assignment = assignments.find(
          entry => entry.id === item.assignmentId,
        );

        if (!assignment) {
          continue;
        }

        const fields = getAssignmentFieldsForDate(assignment, item.date);

        tasks.push({
          childId: assignment.childId,
          taskId: item.id,
          assignmentId: assignment.id,
          date: item.date,
          time: fields.time ?? assignment.time,
          title: fields.title ?? assignment.title,
          localNotificationBeforeMinutes:
            assignment.localNotificationBeforeMinutes,
        });
      }

      await syncChildTaskLocalNotifications({
        childId,
        thisDeviceUsers,
        deliveredNotificationIds: deliveredNotificationIdSet,
        tasks,
      });
    }

    const deferTimer = setTimeout(() => {
      void runSync();
    }, NOTIFICATION_PERMISSION_DEFER_MS);

    return () => {
      clearTimeout(deferTimer);
    };
  }, [
    assignments,
    childId,
    deliveredNotificationIdSet,
    enabled,
    scheduledItems,
    selectedDate,
    thisDeviceUsers,
  ]);
}

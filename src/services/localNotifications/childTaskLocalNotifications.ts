import { parseISO, subMinutes } from 'date-fns';
import * as Notifications from 'expo-notifications';

import {
  MIN_NOTIFY_BEFORE_MINUTES,
  SHOW_NOTIFICATION_IF_USER_WAS,
} from '~/constants/localNotifications';
import { t } from '~/services';
import { store } from '~/store/store';
import {
  pauseSessionChecks,
  resumeSessionChecks,
} from '~/store/settings/slice';
import type { IIdDate } from '~/types/IIdDate';
import { getTodayDateString } from '~/utils/date';
import { createTaskId } from '~/utils/tasks/taskGeneration';

export function buildLocalNotificationId(
  childId: string,
  taskId: string,
): string {
  return `${childId}:${taskId}`;
}

export function childWasOnDeviceRecently(
  childId: string,
  thisDeviceUsers: IIdDate[],
  today = getTodayDateString(),
): boolean {
  const entry = thisDeviceUsers.find(user => user.id === childId);

  if (!entry) {
    return false;
  }

  const todayDate = parseISO(today);
  const lastSeenDate = parseISO(entry.date);
  const diffMs = todayDate.getTime() - lastSeenDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= SHOW_NOTIFICATION_IF_USER_WAS;
}

export function isLocalNotificationEnabled(
  localNotificationBeforeMinutes?: number,
): boolean {
  return (
    localNotificationBeforeMinutes != null &&
    localNotificationBeforeMinutes >= MIN_NOTIFY_BEFORE_MINUTES
  );
}

export type ChildTaskNotificationInput = {
  childId: string;
  taskId: string;
  assignmentId: string;
  date: string;
  time: string;
  title: string;
  localNotificationBeforeMinutes?: number;
};

function parseTaskDateTime(date: string, time: string): Date | null {
  const match = /^(\d{4}-\d{2}-\d{2})$/.exec(date.trim());
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());

  if (!match || !timeMatch) {
    return null;
  }

  return parseISO(`${date}T${time}:00`);
}

export async function ensureLocalNotificationPermissions(): Promise<boolean> {
  store.dispatch(pauseSessionChecks());

  try {
    const settings = await Notifications.getPermissionsAsync();

    if (settings.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();

    return requested.granted;
  } finally {
    store.dispatch(resumeSessionChecks());
  }
}

async function getScheduledTriggerDate(
  notificationId: string,
): Promise<Date | null> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existing = scheduled.find(item => item.identifier === notificationId);

  if (!existing?.trigger || !('date' in existing.trigger)) {
    return null;
  }

  const triggerDate = existing.trigger.date;

  if (triggerDate instanceof Date) {
    return triggerDate;
  }

  if (typeof triggerDate === 'number') {
    return new Date(triggerDate);
  }

  return null;
}

export async function cancelChildTaskLocalNotification(
  childId: string,
  taskId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    buildLocalNotificationId(childId, taskId),
  );
}

export async function cancelLocalNotificationsForAssignment(
  childId: string,
  assignmentId: string,
  dates: string[],
): Promise<void> {
  await Promise.all(
    dates.map(date =>
      cancelChildTaskLocalNotification(
        childId,
        createTaskId(assignmentId, date),
      ),
    ),
  );
}

export async function cancelLocalNotificationsForAssignmentId(
  assignmentId: string,
  childId?: string,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter(item => {
        const data = item.content.data as {
          assignmentId?: string;
          childId?: string;
        };

        if (data?.assignmentId !== assignmentId) {
          return false;
        }

        if (childId && data.childId !== childId) {
          return false;
        }

        return true;
      })
      .map(item =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
  );
}

export async function syncChildTaskLocalNotification(
  input: ChildTaskNotificationInput,
  thisDeviceUsers: IIdDate[],
  deliveredNotificationIds: ReadonlySet<string>,
): Promise<void> {
  const notificationId = buildLocalNotificationId(
    input.childId,
    input.taskId,
  );

  if (deliveredNotificationIds.has(notificationId)) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return;
  }

  const enabled = isLocalNotificationEnabled(
    input.localNotificationBeforeMinutes,
  );

  if (
    !enabled ||
    !childWasOnDeviceRecently(input.childId, thisDeviceUsers)
  ) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return;
  }

  const taskDateTime = parseTaskDateTime(input.date, input.time);

  if (!taskDateTime) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return;
  }

  const notifyBefore = input.localNotificationBeforeMinutes!;
  const triggerDate = subMinutes(taskDateTime, notifyBefore);
  const now = new Date();

  if (triggerDate.getTime() <= now.getTime()) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return;
  }

  const existingTriggerDate = await getScheduledTriggerDate(notificationId);

  if (
    existingTriggerDate &&
    existingTriggerDate.getTime() === triggerDate.getTime()
  ) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);

  const hasPermission = await ensureLocalNotificationPermissions();

  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId,
    content: {
      title: t('tasks.local_notification_title'),
      body: t('tasks.local_notification_body', {
        title: input.title,
        minutes: notifyBefore,
      }),
      data: {
        childId: input.childId,
        taskId: input.taskId,
        assignmentId: input.assignmentId,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function syncChildTaskLocalNotifications(params: {
  childId: string;
  thisDeviceUsers: IIdDate[];
  deliveredNotificationIds: ReadonlySet<string>;
  tasks: ChildTaskNotificationInput[];
}): Promise<void> {
  await Promise.all(
    params.tasks.map(task =>
      syncChildTaskLocalNotification(
        task,
        params.thisDeviceUsers,
        params.deliveredNotificationIds,
      ),
    ),
  );
}

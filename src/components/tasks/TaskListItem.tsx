import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { TaskStatusBadge } from '~/components/tasks/TaskStatusBadge';
import { TaskRewardBadge } from '~/components/tasks/TaskRewardBadge';
import { TaskRewardStarsAnimation } from '~/components/tasks/TaskRewardStarsAnimation';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import {
  ScheduledTaskItem,
  selectTaskListItemViewByScheduledItem,
} from '~/store/tasks/selectors';
import { addTask, updateTask } from '~/store/tasks/slice';
import { selectTaskImageUrls } from '~/store/images';
import { selectUsesCloudSync, selectCanReviewTasks } from '~/store/settings/selectors';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { selectEarnedRewardPeriods } from '~/store/rewards/selectors';
import { isDateInClosedRewardPeriod } from '~/store/rewards/earnedRewardPeriodUtils';
import { Colors } from '~/styles';
import { ETaskStatus } from '~/types/ETask';
import { ITask } from '~/types/ITask';
import { lightenColor } from '~/utils/color';
import { resolvePictureSource } from '~/utils/pictureSource';
import { createTaskId } from '~/utils/tasks/taskGeneration';

type Props = {
  item: ScheduledTaskItem;
  isChildView?: boolean;
  onPress?: () => void;
};

const IMAGE_SIZE = 56;

export const TaskListItem: React.FC<Props> = ({
  item,
  isChildView = false,
  onPress,
}) => {
  const dispatch = useDispatch();
  const customUrls = useSelector(selectTaskImageUrls);
  const usesCloudSync = useSelector(selectUsesCloudSync);
  const canReviewTasks = useSelector(selectCanReviewTasks);
  const earnedRewardPeriods = useSelector(selectEarnedRewardPeriods);
  const assignment = useSelector((state: RootStateT) =>
    selectTaskAssignmentById(item.assignmentId)(state),
  );
  const taskView = useSelector((state: RootStateT) =>
    selectTaskListItemViewByScheduledItem(state, item),
  );
  const isTaskActionLoading = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.LOADING][updateTask.type] ||
      common[ECommonActions.LOADING][addTask.type] ||
      false
    );
  });
  const taskActionError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][updateTask.type]?.message ??
      common[ECommonActions.ERROR][addTask.type]?.message ??
      null
    );
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [areSubtasksExpanded, setAreSubtasksExpanded] = useState(false);
  const [rewardAnimationTrigger, setRewardAnimationTrigger] = useState(0);

  const gradientColors = useMemo(
    () =>
      taskView
        ? ([
            lightenColor(taskView.taskColor, 0.4),
            lightenColor(taskView.taskColor, 0.8),
          ] as const)
        : undefined,
    [taskView],
  );

  const rewardText =
    taskView?.rewardDisplayText ??
    (taskView?.reward != null ? String(taskView.reward) : '');

  const triggerCompletionAnimation = useCallback(() => {
    if (!isChildView || rewardText === '') {
      return;
    }

    setRewardAnimationTrigger(current => current + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [isChildView, rewardText]);

  useEffect(() => {
    if (!isSyncing) {
      return;
    }

    if (!isTaskActionLoading || taskActionError) {
      setIsSyncing(false);
    }
  }, [isSyncing, isTaskActionLoading, taskActionError]);

  if (!taskView || !gradientColors) {
    return null;
  }

  const {
    id,
    assignmentId,
    date,
    task,
    name,
    childName,
    childColor,
    description,
    picture,
    reward,
    rewardDisplayText,
    taskColor,
    subtasks,
    completedSubtasks,
    status,
  } = taskView;

  const hasSubtasks = subtasks.length > 0;
  const isStatusUpdating = usesCloudSync && isSyncing;
  const isPeriodLocked =
    !!assignment &&
    isDateInClosedRewardPeriod(earnedRewardPeriods, assignment.childId, date);
  const canChildModifyTask =
    isChildView && !isPeriodLocked && status !== ETaskStatus.Approved;
  const showReviewActions =
    !isChildView && (!usesCloudSync || canReviewTasks) && !isPeriodLocked;

  const upsertTask = (
    entity: ITask,
    onSynced?: () => void,
  ) => {
    if (usesCloudSync) {
      setIsSyncing(true);
    }

    const handleSynced = () => {
      if (usesCloudSync) {
        setIsSyncing(false);
      }

      onSynced?.();
    };

    if (task) {
      dispatch(updateTask({ entity, onSuccess: handleSynced }));
      return;
    }

    dispatch(addTask({ entity, onSuccess: handleSynced }));
  };

  const setStatus = (
    nextStatus: ETaskStatus,
    nextCompletedSubtasks?: string[],
    onSynced?: () => void,
  ) => {
    if (isPeriodLocked) {
      return;
    }

    if (isChildView && status === ETaskStatus.Approved) {
      return;
    }

    const entity: ITask = {
      id: createTaskId(assignmentId, date),
      assignmentId,
      date,
      status: nextStatus,
      completedSubtasks:
        nextCompletedSubtasks ??
        (nextStatus === ETaskStatus.Completed && hasSubtasks
          ? subtasks.map(subtask => subtask.value)
          : task?.completedSubtasks),
      createdAt: task?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertTask(entity, onSynced);
  };

  const completeTask = (nextCompletedSubtasks?: string[]) => {
    setStatus(ETaskStatus.Completed, nextCompletedSubtasks, () => {
      triggerCompletionAnimation();
    });
  };

  const handleChildStatusPress = () => {
    if (isStatusUpdating || !canChildModifyTask) {
      return;
    }

    if (status === ETaskStatus.Rejected) {
      setStatus(ETaskStatus.Pending, []);
      return;
    }

    if (status === ETaskStatus.Pending) {
      if (hasSubtasks) {
        const allSubtasksDone = subtasks.every(subtask =>
          completedSubtasks.includes(subtask.value),
        );

        if (!allSubtasksDone) {
          setAreSubtasksExpanded(true);
          return;
        }
      }

      completeTask();
      return;
    }

    if (status === ETaskStatus.Completed) {
      setStatus(ETaskStatus.Pending, []);
    }
  };

  const handleParentReviewStatusPress = () => {
    if (isStatusUpdating || isPeriodLocked) {
      return;
    }

    setStatus(ETaskStatus.Completed);
  };

  const canChildPressStatus =
    canChildModifyTask &&
    (status === ETaskStatus.Rejected ||
      status === ETaskStatus.Pending ||
      (!hasSubtasks && status === ETaskStatus.Completed));

  const handleToggleSubtask = (subtaskValue: string, checked: boolean) => {
    if (isStatusUpdating || !canChildModifyTask) {
      return;
    }

    const nextCompleted = checked
      ? [...new Set([...completedSubtasks, subtaskValue])]
      : completedSubtasks.filter(value => value !== subtaskValue);

    const allDone =
      hasSubtasks &&
      subtasks.every(subtask => nextCompleted.includes(subtask.value));

    const nextStatus = allDone ? ETaskStatus.Completed : ETaskStatus.Pending;

    if (allDone && isChildView && status === ETaskStatus.Pending) {
      completeTask(nextCompleted);
      return;
    }

    setStatus(nextStatus, nextCompleted);
  };

  const pictureSource = useMemo(
    () => resolvePictureSource(picture, customUrls, BASE_TASKS_IMAGES),
    [customUrls, picture],
  );

  const renderEditPressable = (
    children: React.ReactNode,
    style?: object,
  ) => {
    if (isChildView || !onPress) {
      return <>{children}</>;
    }

    if (Platform.OS === 'android') {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
          accessibilityRole="button"
          style={style}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  };

  const leftColumnContent = renderEditPressable(
    <View style={styles.leftColumn}>
      {!!childName && !isChildView && (
        <Text
          variant="bodySmall"
          fontFamily="fredoka"
          weight="medium"
          numberOfLines={2}
          style={[styles.childName, { color: childColor }]}
        >
          {childName}
        </Text>
      )}

      <View style={styles.imageContainer}>
        {pictureSource ? (
          <Image
            source={pictureSource}
            style={styles.image}
            contentFit="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text fontFamily="fredoka" weight="bold">
              🎯
            </Text>
          </View>
        )}
      </View>

      <TaskRewardBadge reward={reward} rewardDisplayText={rewardDisplayText} />
    </View>,
    styles.leftColumnPressable,
  );

  const taskName = (
    <Text
      variant="titleLarge"
      fontFamily="fredoka"
      weight="bold"
      numberOfLines={2}
      style={{ color: taskColor, lineHeight: 24 }}
    >
      {name}
    </Text>
  );

  const statusControls = isChildView ? (
    <View style={styles.statusColumn}>
      <TaskStatusBadge
        status={status}
        onPress={canChildPressStatus ? handleChildStatusPress : undefined}
        compact
      />
    </View>
  ) : (
    <View style={styles.statusColumn}>
      {status === ETaskStatus.Completed && showReviewActions ? (
        <>
          <TaskStatusBadge status={ETaskStatus.Completed} compact />
          <TaskStatusBadge
            status={ETaskStatus.Approved}
            labelKey="tasks.taskStatus.approve"
            onPress={
              isStatusUpdating ? undefined : () => setStatus(ETaskStatus.Approved)
            }
            compact
          />
          <TaskStatusBadge
            status={ETaskStatus.Rejected}
            labelKey="tasks.taskStatus.reject"
            onPress={
              isStatusUpdating ? undefined : () => setStatus(ETaskStatus.Rejected)
            }
            compact
          />
        </>
      ) : (
        <TaskStatusBadge
          status={status}
          onPress={
            showReviewActions &&
            (status === ETaskStatus.Approved ||
              status === ETaskStatus.Rejected) &&
            !isStatusUpdating
              ? handleParentReviewStatusPress
              : undefined
          }
          compact
        />
      )}
      {status === ETaskStatus.Completed &&
        usesCloudSync &&
        !canReviewTasks &&
        !isChildView && (
          <Text style={styles.reviewHint} numberOfLines={3}>
            {t('tasks.review_requires_admin_login')}
          </Text>
        )}
      {isPeriodLocked && !isChildView && (
        <Text style={styles.reviewHint} numberOfLines={3}>
          {t('tasks.status_locked_closed_period')}
        </Text>
      )}
    </View>
  );

  const hasBottomContent = !!description || hasSubtasks;

  const contentColumn = (
    <View style={styles.contentColumn} collapsable={false}>
      <View style={styles.topRow}>
        <View style={styles.taskNameArea}>
          {renderEditPressable(taskName, styles.taskNamePressable)}
        </View>

        {statusControls}
      </View>

      {hasBottomContent && (
        <View style={styles.bottomSection}>
          {!!description && (
            <View style={styles.expandableSection}>
              <TouchableOpacity
                onPress={() => setIsDescriptionExpanded(prev => !prev)}
                activeOpacity={0.8}
                style={styles.descriptionToggle}
                accessibilityRole="button"
                accessibilityState={{ expanded: isDescriptionExpanded }}
              >
                <Text style={styles.descriptionLabel}>
                  {t('tasks.description')}
                </Text>
                {isDescriptionExpanded ? (
                  <ChevronUpIcon width={18} height={18} fill={Colors.grey700} />
                ) : (
                  <ChevronDownIcon width={18} height={18} fill={Colors.grey700} />
                )}
              </TouchableOpacity>

              {isDescriptionExpanded && (
                <Text
                  variant="bodySmall"
                  fontFamily="fredoka"
                  weight="medium"
                  style={styles.description}
                >
                  {description}
                </Text>
              )}
            </View>
          )}

          {hasSubtasks && (
            <View style={styles.expandableSection}>
              <TouchableOpacity
                onPress={() => setAreSubtasksExpanded(prev => !prev)}
                activeOpacity={0.8}
                style={styles.descriptionToggle}
                accessibilityRole="button"
                accessibilityState={{ expanded: areSubtasksExpanded }}
              >
                <Text style={styles.descriptionLabel}>
                  {t('tasks.subtasks')}
                </Text>
                {areSubtasksExpanded ? (
                  <ChevronUpIcon width={18} height={18} fill={Colors.grey700} />
                ) : (
                  <ChevronDownIcon width={18} height={18} fill={Colors.grey700} />
                )}
              </TouchableOpacity>

              {areSubtasksExpanded && (
                <View style={styles.subtasksList}>
                  {subtasks.map(subtask => {
                    const checked = completedSubtasks.includes(subtask.value);

                    return (
                      <Pressable
                        key={subtask.value}
                        onPress={() =>
                          canChildModifyTask
                            ? handleToggleSubtask(subtask.value, !checked)
                            : undefined
                        }
                        disabled={!canChildModifyTask || isStatusUpdating}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        style={styles.subtaskRow}
                      >
                        <View
                          style={[
                            styles.subtaskCheckbox,
                            checked && styles.subtaskCheckboxChecked,
                          ]}
                        >
                          {checked && (
                            <Text style={styles.subtaskCheckmark}>✓</Text>
                          )}
                        </View>
                        <View style={styles.subtaskLabelWrapper}>
                          <Text style={styles.subtaskLabel}>{subtask.label}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const row = (
    <View style={styles.cardContent}>
      <View style={styles.headerRow}>
        {leftColumnContent}
        <View style={styles.mainArea}>{contentColumn}</View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { borderColor: taskColor }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          locations={[0.4, 0.8]}
          style={styles.gradient}
        >
          {row}
        </LinearGradient>
      </View>

      {isStatusUpdating && (
        <View pointerEvents="none" style={styles.syncSpinner}>
          <ActivityIndicator size="small" color={taskColor} />
        </View>
      )}

      {!!taskActionError && !isStatusUpdating && (
        <Text style={styles.syncError} numberOfLines={2}>
          {taskActionError}
        </Text>
      )}

      {isChildView && (
        <TaskRewardStarsAnimation
          trigger={rewardAnimationTrigger}
          rewardText={rewardText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible',
  },

  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },

  gradient: {},

  cardContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  mainArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    alignSelf: 'stretch',
  },

  taskNamePressable: {
    borderRadius: 8,
  },

  taskNameArea: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  bottomSection: {
    width: '100%',
    marginTop: 4,
  },

  leftColumn: {
    width: IMAGE_SIZE,
    maxWidth: IMAGE_SIZE,
    flexShrink: 0,
    alignItems: 'flex-start',
  },

  leftColumnPressable: {
    flexShrink: 0,
    borderRadius: 12,
  },

  contentColumn: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    alignSelf: 'stretch',
  },

  expandableSection: {
    width: '100%',
    alignSelf: 'stretch',
  },

  pressed: {
    opacity: 0.9,
  },

  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  childName: {
    width: IMAGE_SIZE,
    maxWidth: IMAGE_SIZE,
    marginBottom: 6,
    fontSize: 13,
    textAlign: 'left',
  },

  descriptionToggle: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  descriptionLabel: {
    color: Colors.grey700,
    fontSize: 14,
    fontWeight: '600',
  },

  description: {
    marginTop: 4,
    width: '100%',
    color: Colors.grey700,
    fontSize: 16,
  },

  subtasksList: {
    marginTop: 4,
    width: '100%',
    gap: 4,
  },

  syncSpinner: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 2,
  },

  syncError: {
    marginTop: 4,
    marginHorizontal: 8,
    color: Colors.red500,
    fontSize: 12,
  },

  reviewHint: {
    marginTop: 4,
    maxWidth: 120,
    color: Colors.grey700,
    fontSize: 11,
    textAlign: 'center',
  },

  subtaskRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  subtaskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.grey600,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtaskCheckboxChecked: {
    backgroundColor: Colors.green500,
    borderColor: Colors.green500,
  },

  subtaskCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: -1,
  },

  subtaskLabel: {
    flex: 1,
    color: Colors.grey700,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'left',
    includeFontPadding: false,
  },

  subtaskLabelWrapper: {
    flex: 1,
  },

  statusColumn: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 6,
  },
});

export default TaskListItem;

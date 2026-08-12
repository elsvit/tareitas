import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { TaskStatusBadge } from '~/components/tasks/TaskStatusBadge';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { RootStateT } from '~/store';
import {
  ScheduledTaskItem,
  selectTaskListItemViewByScheduledItem,
} from '~/store/tasks/selectors';
import { addTask, updateTask } from '~/store/tasks/slice';
import { Colors } from '~/styles';
import { ETaskStatus } from '~/types/ETask';
import { ITask } from '~/types/ITask';
import { lightenColor } from '~/utils/color';
import { createTaskId } from '~/utils/tasks/taskGeneration';

type Props = {
  item: ScheduledTaskItem;
  isChildView?: boolean;
  onPress?: () => void;
};

const IMAGE_SIZE = 56;

type TaskImageKey = keyof typeof BASE_TASKS_IMAGES;

const resolveTaskPictureSource = (
  picture?: string | number,
): ImageSource | number | null => {
  if (picture == null || picture === '') {
    return null;
  }

  if (typeof picture === 'string') {
    if (/^(https?:\/\/|data:)/.test(picture)) {
      return { uri: picture };
    }

    if (picture in BASE_TASKS_IMAGES) {
      return BASE_TASKS_IMAGES[picture as TaskImageKey];
    }
  }

  if (typeof picture === 'number') {
    return picture;
  }

  return null;
};

export const TaskListItem: React.FC<Props> = ({
  item,
  isChildView = false,
  onPress,
}) => {
  const dispatch = useDispatch();
  const taskView = useSelector((state: RootStateT) =>
    selectTaskListItemViewByScheduledItem(state, item),
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [areSubtasksExpanded, setAreSubtasksExpanded] = useState(false);

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
    taskColor,
    subtasks,
    completedSubtasks,
    status,
  } = taskView;

  const hasSubtasks = subtasks.length > 0;

  const upsertTask = (entity: ITask) => {
    if (task) {
      dispatch(updateTask({ entity }));
      return;
    }

    dispatch(addTask({ entity }));
  };

  const setStatus = (nextStatus: ETaskStatus, nextCompletedSubtasks?: string[]) => {
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

    upsertTask(entity);
  };

  const handleChildStatusPress = () => {
    if (status === ETaskStatus.Rejected) {
      setStatus(ETaskStatus.Pending, []);
      return;
    }

    if (status === ETaskStatus.Pending) {
      setStatus(ETaskStatus.Completed);
      return;
    }

    if (status === ETaskStatus.Completed) {
      setStatus(ETaskStatus.Pending, []);
    }
  };

  const canChildPressStatus =
    status === ETaskStatus.Rejected ||
    (!hasSubtasks &&
      (status === ETaskStatus.Pending || status === ETaskStatus.Completed));

  const handleToggleSubtask = (subtaskValue: string, checked: boolean) => {
    const nextCompleted = checked
      ? [...new Set([...completedSubtasks, subtaskValue])]
      : completedSubtasks.filter(value => value !== subtaskValue);

    const allDone =
      hasSubtasks &&
      subtasks.every(subtask => nextCompleted.includes(subtask.value));

    const nextStatus = allDone ? ETaskStatus.Completed : ETaskStatus.Pending;

    setStatus(nextStatus, nextCompleted);
  };

  const pictureSource = useMemo(
    () => resolveTaskPictureSource(picture),
    [picture],
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

  const rewardText = reward != null ? String(reward) : '';
  const isLongReward = rewardText.length > 3;

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

      {reward != null && (
        <View
          style={[
            styles.rewardBadge,
            isLongReward && styles.rewardBadgeCompact,
          ]}
        >
          {isLongReward ? (
            <>
              <Text style={[styles.reward, styles.rewardCompact, styles.rewardLine]}>
                ⭐ {rewardText.slice(0, 3)}
              </Text>
              <Text style={[styles.reward, styles.rewardCompact, styles.rewardLine]}>
                {rewardText.slice(3)}
              </Text>
            </>
          ) : (
            <Text style={styles.reward}>⭐ {rewardText}</Text>
          )}
        </View>
      )}
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
  ) : status === ETaskStatus.Completed ? (
    <View style={styles.statusColumn}>
      <TaskStatusBadge
        status={ETaskStatus.Approved}
        labelKey="tasks.taskStatus.approve"
        onPress={() => setStatus(ETaskStatus.Approved)}
        compact
      />
      <TaskStatusBadge
        status={ETaskStatus.Rejected}
        labelKey="tasks.taskStatus.reject"
        onPress={() => setStatus(ETaskStatus.Rejected)}
        compact
      />
    </View>
  ) : status === ETaskStatus.Approved || status === ETaskStatus.Rejected ? (
    <View style={styles.statusColumn}>
      <TaskStatusBadge status={status} compact />
    </View>
  ) : null;

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
                      <View key={subtask.value} style={styles.subtaskRow}>
                        {isChildView ? (
                          <Pressable
                            onPress={() =>
                              handleToggleSubtask(subtask.value, !checked)
                            }
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked }}
                            style={[
                              styles.subtaskCheckbox,
                              checked && styles.subtaskCheckboxChecked,
                            ]}
                          >
                            {checked && (
                              <Text style={styles.subtaskCheckmark}>✓</Text>
                            )}
                          </Pressable>
                        ) : (
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
                        )}
                        {isChildView ? (
                          <TouchableOpacity
                            style={styles.subtaskLabelPressable}
                            onPress={() =>
                              handleToggleSubtask(subtask.value, !checked)
                            }
                            activeOpacity={0.7}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked }}
                          >
                            <Text style={styles.subtaskLabel}>{subtask.label}</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.subtaskLabelWrapper}>
                            <Text style={styles.subtaskLabel}>{subtask.label}</Text>
                          </View>
                        )}
                      </View>
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
  );
};

const styles = StyleSheet.create({
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

  rewardBadge: {
    marginTop: 6,
    width: IMAGE_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rewardBadgeCompact: {
    paddingHorizontal: 2,
  },

  reward: {
    fontWeight: '600',
    fontSize: 13,
    color: '#F59F00',
  },

  rewardCompact: {
    fontSize: 10,
  },

  rewardLine: {
    textAlign: 'center',
    lineHeight: 12,
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

  subtaskLabelPressable: {
    flex: 1,
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

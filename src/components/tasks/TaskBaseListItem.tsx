import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { DEFAULT_BASE_TASK_COLOR } from '~/constants/tasks';
import { useDebouncedPress } from '~/hooks/useDebouncedPress';
import { TaskRewardBadge } from '~/components/tasks/TaskRewardBadge';
import { Text } from '~/components/ui';
import { ListItemImageEditOverlay } from '~/components/ui/ListItemImageEditOverlay';
import { ResolvedPicture } from '~/components/ui/ResolvedPicture/ResolvedPicture';
import { t } from '~/services';
import { selectTaskImageUrls } from '~/store/images';
import { Colors } from '~/styles';
import { ISubtask } from '~/types/ITask';
import { lightenColor } from '~/utils/color';
type Props = {
  name: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  color?: string;
  subtasks?: ISubtask[];
  onPress?: () => void;
  showEditIcon?: boolean;
};

const IMAGE_SIZE = 56;

function RowPressable({
  onPress,
  style,
  children,
}: {
  onPress?: () => void;
  style?: object;
  children: React.ReactNode;
}) {
  if (!onPress) {
    return <View style={style}>{children}</View>;
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
}

const RowContent: React.FC<{
  name: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  subtasks?: ISubtask[];
  textColor: string;
  showEditIcon?: boolean;
  onImagePress?: () => void;
  onRowPress?: () => void;
  customUrls: Record<string, string>;
}> = ({
  name,
  description,
  picture,
  reward,
  subtasks = [],
  textColor,
  showEditIcon = false,
  onImagePress,
  onRowPress,
  customUrls,
}) => {
  const [areSubtasksExpanded, setAreSubtasksExpanded] = useState(false);
  const hasSubtasks = subtasks.length > 0;

  return (
    <View style={styles.row}>
      <View style={styles.leftColumn}>
        <ListItemImageEditOverlay
          show={showEditIcon}
          iconColor={textColor}
          onPress={onImagePress}
        >
          <View style={styles.imageContainer}>
            <ResolvedPicture
              picture={picture}
              customUrls={customUrls}
              builtInImages={BASE_TASKS_IMAGES}
              style={styles.image}
              contentFit="contain"
              placeholder={
                <View style={styles.placeholder}>
                  <Text fontFamily="fredoka" weight="bold">
                    🎯
                  </Text>
                </View>
              }
            />
          </View>
        </ListItemImageEditOverlay>

        <TaskRewardBadge reward={reward} />
      </View>

      <RowPressable onPress={onRowPress} style={styles.texts}>
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          numberOfLines={2}
          style={[styles.titleText, { color: textColor }]}
        >
          {name}
        </Text>

        {!!description && (
          <Text
            variant="bodySmall"
            fontFamily="fredoka"
            weight="medium"
            numberOfLines={3}
            style={[styles.description]}
          >
            {description}
          </Text>
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
              <Text style={styles.descriptionLabel}>{t('tasks.subtasks')}</Text>
              {areSubtasksExpanded ? (
                <ChevronUpIcon width={18} height={18} fill={Colors.grey700} />
              ) : (
                <ChevronDownIcon width={18} height={18} fill={Colors.grey700} />
              )}
            </TouchableOpacity>

            {areSubtasksExpanded && (
              <View style={styles.subtasksList}>
                {subtasks.map(subtask => (
                  <View key={subtask.value} style={styles.subtaskRow}>
                    <View style={styles.subtaskCheckbox} />
                    <View style={styles.subtaskLabelWrapper}>
                      <Text style={styles.subtaskLabel}>{subtask.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </RowPressable>
    </View>
  );
};

export const TaskBaseListItem: React.FC<Props> = ({
  name,
  description,
  picture,
  reward,
  color = DEFAULT_BASE_TASK_COLOR,
  subtasks,
  onPress,
  showEditIcon: showEditIconProp,
}) => {
  const showEditIcon = showEditIconProp ?? Boolean(onPress);
  const debouncedOnPress = useDebouncedPress(
    useCallback(() => {
      onPress?.();
    }, [onPress]),
  );
  const customUrls = useSelector(selectTaskImageUrls);
  const gradientColors = useMemo(
    () =>
      [lightenColor(color, 0.2), lightenColor(color, 0.8)] as const,
    [color],
  );

  const content = (
    <RowContent
      name={name}
      description={description}
      picture={picture}
      reward={reward}
      subtasks={subtasks}
      textColor={color}
      showEditIcon={showEditIcon}
      onImagePress={showEditIcon ? debouncedOnPress : undefined}
      onRowPress={onPress ? debouncedOnPress : undefined}
      customUrls={customUrls}
    />
  );

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        locations={[0.2, 0.8]}
        style={styles.gradient}
      >
        {content}
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

  pressed: {
    opacity: 0.9,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  leftColumn: {
    width: IMAGE_SIZE,
    maxWidth: IMAGE_SIZE,
    flexShrink: 0,
    alignItems: 'flex-start',
  },

  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    flexShrink: 0,
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

  texts: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
    lineHeight: 24,
  },

  description: {
    marginTop: 4,
    color: Colors.grey700,
    fontSize: 16,
  },

  expandableSection: {
    width: '100%',
    alignSelf: 'stretch',
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
  },

  subtaskLabelWrapper: {
    flex: 1,
  },

  subtaskLabel: {
    flex: 1,
    color: Colors.grey700,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'left',
    includeFontPadding: false,
  },
});

export default TaskBaseListItem;

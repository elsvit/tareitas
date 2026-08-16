import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { DEFAULT_BASE_TASK_COLOR } from '~/constants/tasks';
import { TaskRewardBadge } from '~/components/tasks/TaskRewardBadge';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { selectTaskImageUrls } from '~/store/images';
import { Colors } from '~/styles';
import { ISubtask } from '~/types/ITask';
import { lightenColor } from '~/utils/color';
import { resolvePictureSource } from '~/utils/pictureSource';

type Props = {
  name: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  color?: string;
  subtasks?: ISubtask[];
  onPress?: () => void;
};

const IMAGE_SIZE = 56;

const RowContent: React.FC<{
  name: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  subtasks?: ISubtask[];
  textColor: string;
  customUrls: Record<string, string>;
}> = ({ name, description, picture, reward, subtasks = [], textColor, customUrls }) => {
  const [areSubtasksExpanded, setAreSubtasksExpanded] = useState(false);
  const hasSubtasks = subtasks.length > 0;

  const pictureSource = useMemo(
    () => resolvePictureSource(picture, customUrls, BASE_TASKS_IMAGES),
    [customUrls, picture],
  );

  return (
    <View style={styles.row}>
      <View style={styles.leftColumn}>
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

        <TaskRewardBadge reward={reward} />
      </View>

      <View style={styles.texts} collapsable={false}>
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          numberOfLines={2}
          style={{ color: textColor, lineHeight: 24 }}
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
      </View>
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
}) => {
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
        {onPress ? (
          Platform.OS === 'android' ? (
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.9}
              accessibilityRole="button"
              style={styles.pressable}
            >
              {content}
            </TouchableOpacity>
          ) : (
            <Pressable
              onPress={onPress}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressed,
              ]}
              android_ripple={{
                color: lightenColor(color, 0.08),
                borderless: false,
              }}
            >
              {content}
            </Pressable>
          )
        ) : (
          content
        )}
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

  pressable: {
    borderRadius: 16,
  },

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

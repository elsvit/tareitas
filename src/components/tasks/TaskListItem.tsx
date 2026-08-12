import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { selectTaskListItemViewById } from '~/store/tasks/selectors';
import { Colors } from '~/styles';
import { lightenColor } from '~/utils/color';

type Props = {
  id: string;
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

const RowContent: React.FC<{
  name: string;
  childName: string;
  childColor: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  cardColor: string;
  isDescriptionExpanded: boolean;
  onToggleDescription: () => void;
}> = ({
  name,
  childName,
  childColor,
  description,
  picture,
  reward,
  cardColor,
  isDescriptionExpanded,
  onToggleDescription,
}) => {
  const pictureSource = useMemo(
    () => resolveTaskPictureSource(picture),
    [picture],
  );

  return (
    <View style={styles.row}>
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

      <View style={styles.texts} collapsable={false}>
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          numberOfLines={2}
          style={{ color: cardColor, lineHeight: 24 }}
        >
          {name}
        </Text>

        {!!childName && (
          <Text
            variant="bodySmall"
            fontFamily="fredoka"
            weight="medium"
            numberOfLines={1}
            style={[styles.childName, { color: childColor }]}
          >
            {childName}
          </Text>
        )}

        {reward != null && (
          <Text style={styles.reward}>
            ⭐ {reward}
          </Text>
        )}

        {!!description && (
          <TouchableOpacity
            onPress={onToggleDescription}
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
        )}

        {!!description && isDescriptionExpanded && (
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
    </View>
  );
};

export const TaskListItem: React.FC<Props> = ({ id, onPress }) => {
  const taskView = useSelector(selectTaskListItemViewById(id));
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!taskView) {
    return null;
  }

  const {
    name,
    childName,
    childColor,
    description,
    picture,
    reward,
    taskColor,
  } = taskView;

  const cardColor = taskColor;

  const gradientColors = useMemo(
    () =>
      [lightenColor(cardColor, 0.2), lightenColor(cardColor, 0.8)] as const,
    [cardColor],
  );

  const handleToggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };

  const content = (
    <RowContent
      name={name}
      childName={childName}
      childColor={childColor}
      description={description}
      picture={picture}
      reward={reward}
      cardColor={cardColor}
      isDescriptionExpanded={isDescriptionExpanded}
      onToggleDescription={handleToggleDescription}
    />
  );

  return (
    <View style={[styles.container, { borderColor: cardColor }]}>
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
                color: lightenColor(cardColor, 0.08),
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

  childName: {
    marginTop: 4,
    fontSize: 16,
  },

  reward: {
    marginTop: 6,
    fontWeight: '600',
    color: '#F59F00',
  },

  descriptionToggle: {
    marginTop: 8,
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
    color: Colors.grey700,
    fontSize: 16,
  },
});

export default TaskListItem;

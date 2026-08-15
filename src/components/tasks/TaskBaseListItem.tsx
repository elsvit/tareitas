import React, { useMemo } from 'react';
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
import { DEFAULT_BASE_TASK_COLOR } from '~/constants/tasks';
import { Text } from '~/components/ui';
import { selectTaskImageUrls } from '~/store/images';
import { Colors } from '~/styles';
import { lightenColor } from '~/utils/color';
import { resolvePictureSource } from '~/utils/pictureSource';

type Props = {
  name: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  color?: string;
  onPress?: () => void;
};

const IMAGE_SIZE = 56;

const RowContent: React.FC<{
  name: string;
  description?: string;
  picture?: string | number;
  reward?: number;
  textColor: string;
  customUrls: Record<string, string>;
  color?: string;
}> = ({ name, description, picture, reward, textColor, customUrls }) => {
  const pictureSource = useMemo(
    () => resolvePictureSource(picture, customUrls, BASE_TASKS_IMAGES),
    [customUrls, picture],
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

        {reward != null && (
          <Text style={styles.reward}>
            ⭐ {reward}
          </Text>
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
    alignItems: 'center',
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

  description: {
    marginTop: 4,
    color: Colors.grey700,
    fontSize: 16,
  },

  reward: {
    marginTop: 6,
    fontWeight: '600',
    color: '#F59F00',
  },
});

export default TaskBaseListItem;

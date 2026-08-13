import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { BASE_REWARDS_IMAGES } from '~/assets/img/rewards/rewards';
import { Text } from '~/components/ui';
import { Colors } from '~/styles';
import { lightenColor } from '~/utils/color';

type Props = {
  title: string;
  picture?: string | number;
  reward?: number;
  color?: string;
  onPress?: () => void;
};

const IMAGE_SIZE = 56;

type RewardImageKey = keyof typeof BASE_REWARDS_IMAGES;

const resolveRewardPictureSource = (
  picture?: string | number,
): ImageSource | number | null => {
  if (picture == null || picture === '') {
    return null;
  }

  if (typeof picture === 'string') {
    if (/^(https?:\/\/|data:)/.test(picture)) {
      return { uri: picture };
    }

    if (picture in BASE_REWARDS_IMAGES) {
      return BASE_REWARDS_IMAGES[picture as RewardImageKey];
    }
  }

  if (typeof picture === 'number') {
    return picture;
  }

  return null;
};

const RowContent: React.FC<{
  title: string;
  picture?: string | number;
  reward?: number;
  textColor: string;
}> = ({ title, picture, reward, textColor }) => {
  const pictureSource = useMemo(
    () => resolveRewardPictureSource(picture),
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
              🎁
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
          {title}
        </Text>

        {reward != null && (
          <Text style={styles.reward}>
            ⭐ {reward}
          </Text>
        )}
      </View>
    </View>
  );
};

export const RewardBaseListItem: React.FC<Props> = ({
  title,
  picture,
  reward,
  color = '#F59F00',
  onPress,
}) => {
  const gradientColors = useMemo(
    () =>
      [lightenColor(color, 0.2), lightenColor(color, 0.8)] as const,
    [color],
  );

  const content = (
    <RowContent
      title={title}
      picture={picture}
      reward={reward}
      textColor={color}
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

  reward: {
    marginTop: 6,
    fontWeight: '600',
    color: Colors.orange500,
  },
});

export default RewardBaseListItem;

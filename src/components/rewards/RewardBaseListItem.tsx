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

import { BASE_REWARDS_IMAGES } from '~/assets/img/rewards/rewards';
import { Text } from '~/components/ui';
import { selectRewardImageUrls } from '~/store/images';
import { lightenColor } from '~/utils/color';
import { resolvePictureSource } from '~/utils/pictureSource';

type Props = {
  title: string;
  picture?: string | number;
  reward?: number;
  color?: string;
  onPress?: () => void;
  footer?: React.ReactNode;
};

const IMAGE_SIZE = 56;

const RowContent: React.FC<{
  title: string;
  picture?: string | number;
  reward?: number;
  textColor: string;
  footer?: React.ReactNode;
  customUrls: Record<string, string>;
}> = ({ title, picture, reward, textColor, footer, customUrls }) => {
  const pictureSource = useMemo(
    () => resolvePictureSource(picture, customUrls, BASE_REWARDS_IMAGES),
    [customUrls, picture],
  );

  const rewardText = reward != null ? String(reward) : '';
  const isLongReward = rewardText.length > 3;

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
                🎁
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
                <Text
                  style={[styles.reward, styles.rewardCompact, styles.rewardLine]}
                >
                  ⭐ {rewardText.slice(0, 3)}
                </Text>
                <Text
                  style={[styles.reward, styles.rewardCompact, styles.rewardLine]}
                >
                  {rewardText.slice(3)}
                </Text>
              </>
            ) : (
              <Text style={styles.reward}>⭐ {rewardText}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.texts} collapsable={false}>
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          numberOfLines={2}
          style={{ color: textColor, lineHeight: 22 }}
        >
          {title}
        </Text>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  footer,
}) => {
  const customUrls = useSelector(selectRewardImageUrls);
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
      footer={footer}
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
    alignItems: 'stretch',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  leftColumn: {
    alignItems: 'center',
    flexShrink: 0,
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
    justifyContent: 'space-between',
  },

  rewardBadge: {
    marginTop: 6,
    width: IMAGE_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 2,
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

  footer: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
});

export default RewardBaseListItem;

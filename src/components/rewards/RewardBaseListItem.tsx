import React, { useCallback, useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

import { BASE_REWARDS_IMAGES } from '~/assets/img/rewards/rewards';
import { useDebouncedPress } from '~/hooks/useDebouncedPress';
import { Text } from '~/components/ui';
import { ListItemImageEditOverlay } from '~/components/ui/ListItemImageEditOverlay';
import { ResolvedPicture } from '~/components/ui/ResolvedPicture/ResolvedPicture';
import { selectRewardImageUrls } from '~/store/images';
import { lightenColor } from '~/utils/color';
type Props = {
  title: string;
  picture?: string | number;
  reward?: number;
  color?: string;
  childName?: string;
  childColor?: string;
  onPress?: () => void;
  showEditIcon?: boolean;
  footer?: React.ReactNode;
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
  title: string;
  picture?: string | number;
  reward?: number;
  textColor: string;
  childName?: string;
  childColor?: string;
  footer?: React.ReactNode;
  showEditIcon?: boolean;
  onImagePress?: () => void;
  onRowPress?: () => void;
  customUrls: Record<string, string>;
}> = ({
  title,
  picture,
  reward,
  textColor,
  childName,
  childColor,
  footer,
  showEditIcon = false,
  onImagePress,
  onRowPress,
  customUrls,
}) => {
  const rewardText = reward != null ? String(reward) : '';
  const isLongReward = rewardText.length > 3;

  return (
    <View style={styles.row}>
      <View style={styles.leftColumn}>
        {!!childName && (
          <Text
            variant="bodySmall"
            fontFamily="fredoka"
            weight="medium"
            numberOfLines={2}
            style={[styles.childName, { color: childColor ?? textColor }]}
          >
            {childName}
          </Text>
        )}

        <ListItemImageEditOverlay
          show={showEditIcon}
          iconColor={textColor}
          onPress={onImagePress}
        >
          <View style={styles.imageContainer}>
            <ResolvedPicture
              picture={picture}
              customUrls={customUrls}
              builtInImages={BASE_REWARDS_IMAGES}
              style={styles.image}
              contentFit="contain"
              placeholder={
                <View style={styles.placeholder}>
                  <Text fontFamily="fredoka" weight="bold">
                    🎁
                  </Text>
                </View>
              }
            />
          </View>
        </ListItemImageEditOverlay>

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
                  ⭐ {rewardText.slice(0, 4)}
                </Text>
                {rewardText.slice(4) && (<Text
                  style={[styles.reward, styles.rewardCompact, styles.rewardLine]}
                  >
                    {rewardText.slice(4)}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.reward}>⭐ {rewardText}</Text>
            )}
          </View>
        )}
      </View>

      <RowPressable
        onPress={onRowPress}
        style={styles.texts}
      >
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          numberOfLines={2}
          style={[styles.titleText, { color: textColor }]}
        >
          {title}
        </Text>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </RowPressable>
    </View>
  );
};

export const RewardBaseListItem: React.FC<Props> = ({
  title,
  picture,
  reward,
  color = '#F59F00',
  childName,
  childColor,
  onPress,
  showEditIcon: showEditIconProp,
  footer,
}) => {
  const showEditIcon = showEditIconProp ?? Boolean(onPress);
  const debouncedOnPress = useDebouncedPress(
    useCallback(() => {
      onPress?.();
    }, [onPress]),
  );
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
      childName={childName}
      childColor={childColor}
      footer={footer}
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
    alignItems: 'stretch',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  leftColumn: {
    alignItems: 'center',
    flexShrink: 0,
  },

  childName: {
    width: IMAGE_SIZE,
    maxWidth: IMAGE_SIZE,
    marginBottom: 6,
    fontSize: 13,
    textAlign: 'left',
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
  titleText: {
    flex: 1,
    minWidth: 0,
    lineHeight: 22,
  },

  rewardBadge: {
    marginTop: 6,
    width: IMAGE_SIZE,
    minHeight: 28,
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

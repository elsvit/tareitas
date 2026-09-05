import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  type ImageSourcePropType,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { Text } from '~/components/ui/Text';

export type BottomTabProps = {
  Icon: ImageSourcePropType;
  ActiveIcon: ImageSourcePropType;
  focused?: boolean;
  label?: string;
  compactLabel?: boolean;
  badge?: number | string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
};

const TABLET_MIN_WIDTH = 600;
const PHONE_FALLBACK_WIDTH = 390;
const COMPACT_PHONE_LABEL_FONT_SIZE = 13;
const COMPACT_TABLET_LABEL_FONT_SIZE = 12;

const getTabMetrics = (screenWidth: number) => {
  const width = screenWidth > 0 ? screenWidth : PHONE_FALLBACK_WIDTH;

  if (width >= TABLET_MIN_WIDTH) {
    return {
      iconSize: 76,
      hitWidth: 116,
      hitHeight: 84,
      labelBottom: -14,
      labelFontSize: 15,
    };
  }

  return {
    iconSize: width * 0.17,
    hitWidth: width * 0.28,
    hitHeight: 72,
    labelBottom: -14,
    labelFontSize: 16,
  };
};

const ACTIVE_COLOR = '#FEF30C';
const INACTIVE_COLOR = '#4FB3FF';

export const BottomTab: React.FC<BottomTabProps> = ({
  Icon,
  ActiveIcon,
  focused = false,
  label,
  compactLabel = false,
  badge,
  badgeBackgroundColor = '#FF3B30',
  badgeTextColor = '#fff',
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const layoutWidth =
    screenWidth > 0 ? screenWidth : Dimensions.get('window').width;
  const metrics = useMemo(
    () => getTabMetrics(layoutWidth),
    [layoutWidth],
  );
  const labelFontSize = compactLabel
    ? layoutWidth >= TABLET_MIN_WIDTH
      ? COMPACT_TABLET_LABEL_FONT_SIZE
      : COMPACT_PHONE_LABEL_FONT_SIZE
    : metrics.labelFontSize;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.hitArea,
          {
            width: metrics.hitWidth,
            height: metrics.hitHeight,
          },
        ]}
      >
        <View style={[styles.iconWrapper, { width: metrics.hitWidth }]}>
          <Image
            source={focused ? ActiveIcon : Icon}
            style={{ width: metrics.iconSize, height: metrics.iconSize }}
            resizeMode="contain"
          />

          {label ? (
            <View
              style={[
                styles.labelOverlay,
                {
                  bottom: metrics.labelBottom,
                  width: metrics.hitWidth,
                },
              ]}
            >
              <Text
                fontFamily="fredoka"
                weight="bold"
                style={[
                  styles.labelText,
                  {
                    color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
                    fontSize: labelFontSize,
                    lineHeight: labelFontSize + 2,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          ) : null}

          {badge ? (
            <View
              style={[styles.badge, { backgroundColor: badgeBackgroundColor }]}
            >
              <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                {String(badge)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  hitArea: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelOverlay: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
  },

  labelText: {
    textAlign: 'center',
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 20,
  },

  badgeText: {
    fontSize: 10,
  },
});

export default BottomTab;

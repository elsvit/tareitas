import React, { useMemo } from 'react';
import {
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
  badge?: number | string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
};

const TABLET_MIN_WIDTH = 600;

const ACTIVE_COLOR = '#FEF30C';
const INACTIVE_COLOR = '#4FB3FF';

const getTabMetrics = (screenWidth: number) => {
  if (screenWidth >= TABLET_MIN_WIDTH) {
    return {
      iconSize: 76,
      hitWidth: 116,
      hitHeight: 84,
      labelBottom: -14,
      labelFontSize: 15,
    };
  }

  return {
    iconSize: screenWidth * 0.17,
    hitWidth: screenWidth * 0.28,
    hitHeight: 72,
    labelBottom: -14,
    labelFontSize: 16,
  };
};

export const BottomTab: React.FC<BottomTabProps> = ({
  Icon,
  ActiveIcon,
  focused = false,
  label,
  badge,
  badgeBackgroundColor = '#FF3B30',
  badgeTextColor = '#fff',
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const metrics = useMemo(() => getTabMetrics(screenWidth), [screenWidth]);

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
                    fontSize: metrics.labelFontSize,
                    lineHeight: metrics.labelFontSize + 2,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
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

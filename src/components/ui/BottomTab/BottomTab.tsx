import React from 'react';
import {
  Dimensions,
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '~/components/ui';

export type BottomTabProps = {
  Icon: ImageSourcePropType;
  ActiveIcon: ImageSourcePropType;
  focused?: boolean;
  label?: string;
  badge?: number | string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// WEBP assets fill the frame more than old PNGs — ~0.20 matches old PNG look at 0.28.
const ICON_SIZE = 60;
// const ICON_SIZE = SCREEN_WIDTH * 0.17;
// Keep tap area stable — change this, not ICON_SIZE, to preserve clicks.

// const TAB_HIT_WIDTH = SCREEN_WIDTH * 0.28;
const TAB_HIT_WIDTH = SCREEN_WIDTH * 0.24;
const TAB_HIT_HEIGHT = 80;

const ACTIVE_COLOR = '#FEF30C';
const INACTIVE_COLOR = '#4FB3FF';

export const BottomTab: React.FC<BottomTabProps> = ({
  Icon,
  ActiveIcon,
  focused = false,
  label,
  badge,
  badgeBackgroundColor = '#FF3B30',
  badgeTextColor = '#fff',
}) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.hitArea,
          { width: TAB_HIT_WIDTH, height: TAB_HIT_HEIGHT },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Image
            source={focused ? ActiveIcon : Icon}
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
            resizeMode="contain"
          />

          {label ? (
            <View style={styles.labelOverlay}>
              <Text
                fontFamily="fredoka"
                weight="bold"
                style={[
                  styles.labelText,
                  { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR },
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
    width: TAB_HIT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelOverlay: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    width: TAB_HIT_WIDTH,
    alignItems: 'center',
  },

  labelText: {
    fontSize: 16,
    lineHeight: 18,
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

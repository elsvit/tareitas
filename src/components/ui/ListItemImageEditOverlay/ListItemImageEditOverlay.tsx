import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import EditIcon from '~/assets/svg/common/edit.svg';
import { Colors } from '~/styles';

type Props = {
  show: boolean;
  iconColor?: string;
  size?: number;
  /** Opens edit — same handler for the thumbnail and the pencil badge. */
  onPress?: () => void;
  children: React.ReactNode;
};

const DEFAULT_SIZE = 56;

function ThumbnailPressable({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  if (Platform.OS === 'android') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Edit"
        style={styles.pressTarget}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit"
      style={({ pressed }) => [
        styles.pressTarget,
        pressed && styles.pressTargetPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function ListItemImageEditOverlay({
  show,
  iconColor = Colors.blue600,
  size = DEFAULT_SIZE,
  onPress,
  children,
}: Props) {
  const badge = show ? (
    <View style={styles.badge} pointerEvents="none">
      <EditIcon width={11} height={11} fill={iconColor} />
    </View>
  ) : null;

  const thumbnail = (
    <>
      {children}
      {badge}
    </>
  );

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {onPress ? (
        <ThumbnailPressable onPress={onPress}>{thumbnail}</ThumbnailPressable>
      ) : (
        thumbnail
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 2,
    overflow: 'visible',
  },
  pressTarget: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  pressTargetPressed: {
    opacity: 0.88,
  },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
});

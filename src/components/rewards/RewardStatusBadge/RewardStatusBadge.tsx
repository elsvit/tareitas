import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '~/components/ui';

type Props = {
  label: string;
  color: string;
  onPress?: () => void;
  compact?: boolean;
};

export const RewardStatusBadge: React.FC<Props> = ({
  label,
  color,
  onPress,
  compact = false,
}) => {
  const content = (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: color },
      ]}
    >
      <Text
        style={[styles.label, compact && styles.labelCompact]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
  },
  badgeCompact: {
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default RewardStatusBadge;

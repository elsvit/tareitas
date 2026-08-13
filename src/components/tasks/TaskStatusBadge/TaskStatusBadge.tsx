import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '~/components/ui';
import { normalizeTaskStatus, TASK_STATUS_COLORS } from '~/constants/tasks/taskStatus';
import { t } from '~/services';
import { ETaskStatus } from '~/types/ETask';

type Props = {
  status: ETaskStatus;
  onPress?: () => void;
  compact?: boolean;
  labelKey?: string;
};

const STATUS_LABEL_KEYS: Record<ETaskStatus, string> = {
  [ETaskStatus.Pending]: 'tasks.taskStatus.pending',
  [ETaskStatus.Completed]: 'tasks.taskStatus.completed',
  [ETaskStatus.Approved]: 'tasks.taskStatus.approved',
  [ETaskStatus.Rejected]: 'tasks.taskStatus.rejected',
};

export const TaskStatusBadge: React.FC<Props> = ({
  status,
  onPress,
  compact = false,
  labelKey,
}) => {
  const resolvedStatus = normalizeTaskStatus(status);
  const color =
    TASK_STATUS_COLORS[resolvedStatus] ?? TASK_STATUS_COLORS[ETaskStatus.Pending];
  const label = t(
    (labelKey ?? STATUS_LABEL_KEYS[resolvedStatus]) as any,
  );

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

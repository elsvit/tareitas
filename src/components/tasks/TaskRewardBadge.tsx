import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '~/components/ui';

const IMAGE_SIZE = 56;

type TaskRewardBadgeProps = {
  reward?: number;
  rewardDisplayText?: string | null;
};

export function TaskRewardBadge({
  reward,
  rewardDisplayText,
}: TaskRewardBadgeProps) {
  const rewardText = rewardDisplayText ?? (reward != null ? String(reward) : '');

  if (rewardText === '') {
    return null;
  }

  const isLongReward = rewardText.length > 3;

  return (
    <View
      style={[styles.rewardBadge, isLongReward && styles.rewardBadgeCompact]}
    >
      {isLongReward ? (
        <>
          <Text style={[styles.reward, styles.rewardCompact, styles.rewardLine]}>
            ⭐ {rewardText.slice(0, 3)}
          </Text>
          <Text style={[styles.reward, styles.rewardCompact, styles.rewardLine]}>
            {rewardText.slice(3)}
          </Text>
        </>
      ) : (
        <Text style={styles.reward}>⭐ {rewardText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rewardBadge: {
    marginTop: 6,
    width: IMAGE_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 6,
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
});

export default TaskRewardBadge;

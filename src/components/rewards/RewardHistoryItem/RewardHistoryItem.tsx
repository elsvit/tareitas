import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { Colors } from '~/styles';

type RewardHistoryItemProps = {
  childName: string;
  remainingRewardFromPreviousMonths: number | null;
  monthReward: number;
  canApprovePeriod: boolean;
  onApprovePeriod?: () => void;
};

export function RewardHistoryItem({
  childName,
  remainingRewardFromPreviousMonths,
  monthReward,
  canApprovePeriod,
  onApprovePeriod,
}: RewardHistoryItemProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" weight="bold">
        {childName}
      </Text>
      {remainingRewardFromPreviousMonths !== null && (
        <Text variant="bodyMedium">
          {t('rewards.initial_reward')}: ⭐ {remainingRewardFromPreviousMonths}
        </Text>
      )}
      <Text variant="bodyMedium">
        {t('rewards.month_reward')}: ⭐ {monthReward}
      </Text>
      {canApprovePeriod && onApprovePeriod && (
        <Pressable style={styles.approveButton} onPress={onApprovePeriod}>
          <Text style={styles.approveButtonText}>
            {t('rewards.approve_period')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    gap: 4,
  },
  approveButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.blue100,
  },
  approveButtonText: {
    color: Colors.blue500,
    fontWeight: '600',
  },
});

export default RewardHistoryItem;

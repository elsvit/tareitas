import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import * as Haptics from 'expo-haptics';

import { RewardBaseListItem } from '~/components/rewards/RewardBaseListItem';
import { RewardSelectSparkleAnimation } from '~/components/rewards/RewardSelectSparkleAnimation';
import { RewardStatusBadge } from '~/components/rewards/RewardStatusBadge';
import {
  getChildRewardStatusColor,
  REWARD_STATUS_COLORS,
} from '~/constants/rewards/rewardStatus';
import { t } from '~/services';
import { playAppSound } from '~/services/appSounds';
import { ERewardStatus } from '~/types/EReward';

export type RewardItemMode =
  | 'child'
  | 'parentSelected'
  | 'parentApproved'
  | 'assignment'
  | 'completed';

type Props = {
  title: string;
  picture?: string;
  reward: number;
  mode: RewardItemMode;
  childName?: string;
  childColor?: string;
  status?: ERewardStatus;
  canAfford?: boolean;
  completedDate?: string;
  onPress?: () => void;
  onSelect?: () => void;
  onRedeem?: () => void;
  onCancelPending?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  isActionLoading?: boolean;
  actionLoadingColor?: string;
};

const getChildLeftLabel = (
  status: ERewardStatus | undefined,
  canAfford: boolean,
) => {
  if (status === ERewardStatus.Approved) {
    return t('rewards.status.approved');
  }

  if (status === ERewardStatus.Rejected) {
    return t('rewards.status.rejected');
  }

  if (status === ERewardStatus.Selected) {
    return t('rewards.status.pending');
  }

  return canAfford
    ? t('rewards.status.available')
    : t('rewards.status.not_enough_stars');
};

export const RewardItem: React.FC<Props> = ({
  title,
  picture,
  reward,
  mode,
  childName,
  childColor,
  status,
  canAfford = false,
  onPress,
  onSelect,
  onRedeem,
  onCancelPending,
  onApprove,
  onReject,
  onComplete,
  completedDate,
  isActionLoading = false,
  actionLoadingColor = '#F59F00',
}) => {
  const [selectAnimationTrigger, setSelectAnimationTrigger] = useState(0);
  const parentActionsDisabled = isActionLoading;

  const handleSelectPress = useCallback(() => {
    if (!onSelect) {
      return;
    }

    setSelectAnimationTrigger(current => current + 1);
    void playAppSound('rewardSelect');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect();
  }, [onSelect]);

  const renderChildFooter = () => {
    const leftLabel = getChildLeftLabel(status, canAfford);

    let actionLabel: string | null = null;
    let actionHandler: (() => void) | undefined;

    if (status === ERewardStatus.Approved) {
      // when status is approved, the child can enjoy the reward
      actionLabel = t('rewards.action.enjoy_it');
    } else if (status === ERewardStatus.Selected) {
      // when status is selected, the child can cancel the reward
      actionLabel = t('rewards.action.cancel');
      actionHandler = onRedeem;
    } else if (status === ERewardStatus.Rejected) {
      // when status is rejected, the child can select the reward again
      actionLabel = t('rewards.action.select_again');
      actionHandler = handleSelectPress;
    } else if (canAfford) {
      // when the reward is affordable, the child can select the reward
      actionLabel = t('rewards.action.select');
      actionHandler = handleSelectPress;
    }

    return (
      <View style={styles.footer}>
        <RewardStatusBadge
          label={leftLabel}
          color={getChildRewardStatusColor(status, canAfford)}
          onPress={
            status === ERewardStatus.Selected ? onCancelPending : undefined
          }
          compact
        />
        {actionLabel ? (
          <RewardStatusBadge
            label={actionLabel}
            color={REWARD_STATUS_COLORS.action}
            onPress={actionHandler}
            compact
          />
        ) : null}
      </View>
    );
  };

  const renderParentSelectedFooter = () => (
    <View style={styles.footer}>
      <RewardStatusBadge
        label={t('rewards.status.selected')}
        color={REWARD_STATUS_COLORS.pending}
        compact
      />
      <View style={styles.parentActions}>
        <RewardStatusBadge
          label={t('rewards.action.reject')}
          color={REWARD_STATUS_COLORS.rejected}
          onPress={parentActionsDisabled ? undefined : onReject}
          compact
        />
        <RewardStatusBadge
          label={t('rewards.action.approve')}
          color={REWARD_STATUS_COLORS.approved}
          onPress={parentActionsDisabled ? undefined : onApprove}
          compact
        />
      </View>
    </View>
  );

  const renderParentApprovedFooter = () => (
    <View style={styles.footer}>
      <RewardStatusBadge
        label={t('rewards.status.approved')}
        color={REWARD_STATUS_COLORS.approved}
        compact
      />
      <View style={styles.parentActions}>
        <RewardStatusBadge
          label={t('rewards.action.reject')}
          color={REWARD_STATUS_COLORS.rejected}
          onPress={parentActionsDisabled ? undefined : onReject}
          compact
        />
        <RewardStatusBadge
          label={t('rewards.action.complete')}
          color={REWARD_STATUS_COLORS.approved}
          onPress={parentActionsDisabled ? undefined : onComplete}
          compact
        />
      </View>
    </View>
  );

  const renderCompletedFooter = () => (
    <View style={styles.footer}>
      <RewardStatusBadge
        label={t('rewards.status.completed')}
        color={REWARD_STATUS_COLORS.approved}
        compact
      />
      {completedDate ? (
        <RewardStatusBadge
          label={completedDate}
          color={REWARD_STATUS_COLORS.action}
          compact
        />
      ) : null}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {mode === 'child' ? (
        <RewardSelectSparkleAnimation trigger={selectAnimationTrigger} />
      ) : null}
      <RewardBaseListItem
        title={title}
        picture={picture}
        reward={reward}
        childName={mode === 'child' ? undefined : childName}
        childColor={mode === 'child' ? undefined : childColor}
        onPress={onPress}
        footer={
          mode === 'child'
            ? renderChildFooter()
            : mode === 'parentSelected'
              ? renderParentSelectedFooter()
              : mode === 'parentApproved'
                ? renderParentApprovedFooter()
                : mode === 'completed'
                  ? renderCompletedFooter()
                  : undefined
        }
      />
      {isActionLoading ? (
        <View pointerEvents="none" style={styles.actionSpinner}>
          <ActivityIndicator size="small" color={actionLoadingColor} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  actionSpinner: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  parentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
});

export default RewardItem;

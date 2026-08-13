import React from 'react';
import { StyleSheet, View } from 'react-native';

import { RewardBaseListItem } from '~/components/rewards/RewardBaseListItem';
import { RewardStatusBadge } from '~/components/rewards/RewardStatusBadge';
import {
  getChildRewardStatusColor,
  REWARD_STATUS_COLORS,
} from '~/constants/rewards/rewardStatus';
import { t } from '~/services';
import { ERewardStatus } from '~/types/EReward';

export type RewardItemMode =
  | 'child'
  | 'parentSelected'
  | 'parentApproved'
  | 'assignment';

type Props = {
  title: string;
  picture?: string;
  reward: number;
  mode: RewardItemMode;
  status?: ERewardStatus;
  canAfford?: boolean;
  onPress?: () => void;
  onSelect?: () => void;
  onRedeem?: () => void;
  onCancelPending?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
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
  status,
  canAfford = false,
  onPress,
  onSelect,
  onRedeem,
  onCancelPending,
  onApprove,
  onReject,
  onComplete,
}) => {
  const renderChildFooter = () => {
    const leftLabel = getChildLeftLabel(status, canAfford);

    let actionLabel: string | null = null;
    let actionHandler: (() => void) | undefined;

    if (status === ERewardStatus.Approved) {
      actionLabel = t('rewards.action.enjoy_it');
    } else if (status === ERewardStatus.Selected) {
      actionLabel = t('rewards.action.redeemed');
      actionHandler = onRedeem;
    } else if (status === ERewardStatus.Rejected) {
      actionLabel = t('rewards.action.redeem_again');
      actionHandler = onSelect;
    } else if (canAfford) {
      actionLabel = t('rewards.action.select');
      actionHandler = onSelect;
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
          onPress={onReject}
          compact
        />
        <RewardStatusBadge
          label={t('rewards.action.approve')}
          color={REWARD_STATUS_COLORS.approved}
          onPress={onApprove}
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
          onPress={onReject}
          compact
        />
        <RewardStatusBadge
          label={t('rewards.action.complete')}
          color={REWARD_STATUS_COLORS.approved}
          onPress={onComplete}
          compact
        />
      </View>
    </View>
  );

  return (
    <RewardBaseListItem
      title={title}
      picture={picture}
      reward={reward}
      onPress={onPress}
      footer={
        mode === 'child'
          ? renderChildFooter()
          : mode === 'parentSelected'
            ? renderParentSelectedFooter()
            : mode === 'parentApproved'
              ? renderParentApprovedFooter()
              : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
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

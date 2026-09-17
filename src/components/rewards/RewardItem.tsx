import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import * as Haptics from 'expo-haptics';

import { RewardBaseListItem } from '~/components/rewards/RewardBaseListItem';
import { RewardSelectSparkleAnimation } from '~/components/rewards/RewardSelectSparkleAnimation';
import { RewardStatusBadge } from '~/components/rewards/RewardStatusBadge';
import { Text } from '~/components/ui';
import {
  getChildRewardStatusColor,
  REWARD_STATUS_COLORS,
} from '~/constants/rewards/rewardStatus';
import { t } from '~/services';
import { playAppSound } from '~/services/appSounds';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { addReward, updateReward } from '~/store/rewards/slice';
import { ERewardStatus } from '~/types/EReward';
import { Colors } from '~/styles';

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
}) => {
  const [selectAnimationTrigger, setSelectAnimationTrigger] = useState(0);

  const rewardActionError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][updateReward.type]?.message ??
      common[ECommonActions.ERROR][addReward.type]?.message ??
      null
    );
  });

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
      actionLabel = t('rewards.action.enjoy_it');
    } else if (status === ERewardStatus.Selected) {
      actionLabel = t('rewards.action.redeemed');
      actionHandler = onRedeem;
    } else if (status === ERewardStatus.Rejected) {
      actionLabel = t('rewards.action.redeem_again');
      actionHandler = handleSelectPress;
    } else if (canAfford) {
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
      {!!rewardActionError && mode !== 'child' && mode !== 'assignment' ? (
        <Text style={styles.actionError} numberOfLines={2}>
          {rewardActionError}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
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
  actionError: {
    marginTop: 4,
    color: Colors.red500,
    fontSize: 12,
  },
});

export default RewardItem;

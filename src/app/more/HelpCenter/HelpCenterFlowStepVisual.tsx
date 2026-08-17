import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import ChevronRightIcon from '~/assets/svg/common/chevron-right.svg';
import PlusIcon from '~/assets/svg/common/plus.svg';
import STAR_IMAGE from '~/assets/img/common/star.png';
import { RewardStatusBadge } from '~/components/rewards/RewardStatusBadge';
import { TaskStatusBadge } from '~/components/tasks/TaskStatusBadge/TaskStatusBadge';
import { REWARD_STATUS_COLORS } from '~/constants/rewards/rewardStatus';
import { t } from '~/services';
import { Colors } from '~/styles';
import { ETaskStatus } from '~/types/ETask';

type Props = {
  stepIndex: number;
};

const FlowArrow = () => (
  <ChevronRightIcon width={14} height={14} fill={Colors.grey500} />
);

export const HelpCenterFlowStepVisual: React.FC<Props> = ({ stepIndex }) => {
  switch (stepIndex) {
    case 0:
      return (
        <View style={styles.visual}>
          <View style={styles.addButton}>
            <PlusIcon width={18} height={18} fill="#FFFFFF" />
          </View>
        </View>
      );

    case 1:
      return (
        <View style={styles.visual}>
          <TaskStatusBadge status={ETaskStatus.Pending} compact />
          <FlowArrow />
          <TaskStatusBadge status={ETaskStatus.Completed} compact />
        </View>
      );

    case 2:
      return (
        <View style={styles.visual}>
          <TaskStatusBadge status={ETaskStatus.Completed} compact />
          <FlowArrow />
          <TaskStatusBadge status={ETaskStatus.Approved} compact />
        </View>
      );

    case 3:
      return (
        <View style={styles.visual}>
          <Image source={STAR_IMAGE} style={styles.starImage} resizeMode="contain" />
        </View>
      );

    case 4:
      return (
        <View style={styles.visual}>
          <RewardStatusBadge
            label={t('rewards.status.available')}
            color={REWARD_STATUS_COLORS.available}
            compact
          />
          <RewardStatusBadge
            label={t('rewards.action.select')}
            color={REWARD_STATUS_COLORS.action}
            compact
          />
        </View>
      );

    case 5:
      return (
        <View style={styles.visual}>
          <RewardStatusBadge
            label={t('rewards.status.selected')}
            color={REWARD_STATUS_COLORS.pending}
            compact
          />
          <FlowArrow />
          <RewardStatusBadge
            label={t('rewards.status.approved')}
            color={REWARD_STATUS_COLORS.approved}
            compact
          />
        </View>
      );

    case 6:
      return (
        <View style={styles.visual}>
          <RewardStatusBadge
            label={t('rewards.status.approved')}
            color={REWARD_STATUS_COLORS.approved}
            compact
          />
          <FlowArrow />
          <RewardStatusBadge
            label={t('rewards.action.complete')}
            color={REWARD_STATUS_COLORS.approved}
            compact
          />
        </View>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  visual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    maxWidth: '100%',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starImage: {
    width: 28,
    height: 28,
  },
});

export default HelpCenterFlowStepVisual;

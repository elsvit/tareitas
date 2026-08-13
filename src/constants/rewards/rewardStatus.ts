import { Colors } from '~/styles/colors';
import { ERewardStatus } from '~/types/EReward';

export const REWARD_STATUS_COLORS = {
  available: Colors.green500,
  notEnoughStars: Colors.grey500,
  pending: Colors.orange500,
  approved: Colors.green500,
  rejected: Colors.red500,
  action: Colors.green500,
} as const;

export const getChildRewardStatusColor = (
  status: ERewardStatus | undefined,
  canAfford: boolean,
) => {
  if (status === ERewardStatus.Approved) {
    return REWARD_STATUS_COLORS.approved;
  }

  if (status === ERewardStatus.Rejected) {
    return REWARD_STATUS_COLORS.rejected;
  }

  if (status === ERewardStatus.Selected) {
    return REWARD_STATUS_COLORS.pending;
  }

  return canAfford
    ? REWARD_STATUS_COLORS.available
    : REWARD_STATUS_COLORS.notEnoughStars;
};

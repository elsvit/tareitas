import { getBaseRewards } from '~/constants/rewards';
import { IRewardAssignment, IRewardBase } from '~/types/IReward';

export function inferRewardAssignmentPicture(
  assignment: Pick<IRewardAssignment, 'title' | 'picture'>,
  rewardBase: IRewardBase[],
): string | undefined {
  if (assignment.picture) {
    return assignment.picture;
  }

  const fromCatalog = rewardBase.find(item => item.title === assignment.title);

  if (fromCatalog?.picture) {
    return fromCatalog.picture;
  }

  return getBaseRewards().find(item => item.title === assignment.title)?.picture;
}

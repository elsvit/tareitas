import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { RewardForm } from '~/components/rewards/RewardForm';
import { selectRewardAssignmentById } from '~/store/rewardAssignment/selectors';
import { updateRewardAssignment } from '~/store/rewardAssignment/slice';
import { EFormMode } from '~/types/ECommon';
import { IRewardAssignment, RewardAssignmentFormProps } from '~/types/IReward';

export default function RewardEdit() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { params } = useRoute<RouteProp<Record<string, { id?: string }>, string>>();
  const rewardId = params?.id ?? '';
  const reward = useSelector(selectRewardAssignmentById(rewardId));

  const handleSave = (values: RewardAssignmentFormProps) => {
    if (!reward) {
      return;
    }

    const updatedReward: IRewardAssignment = {
      ...reward,
      updatedAt: new Date().toISOString(),
      ...values,
    };

    dispatch(
      updateRewardAssignment({
        entity: updatedReward,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  if (!reward) {
    return null;
  }

  return (
    <SafeAreaBgImage>
      <RewardForm mode={EFormMode.Edit} reward={reward} onSave={handleSave} />
    </SafeAreaBgImage>
  );
}

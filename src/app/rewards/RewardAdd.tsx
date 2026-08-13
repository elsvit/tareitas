import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { RewardForm } from '~/components/rewards/RewardForm';
import { addRewardAssignment } from '~/store/rewardAssignment/slice';
import { EFormMode } from '~/types/ECommon';
import { IRewardAssignment, RewardAssignmentFormProps } from '~/types/IReward';

export default function RewardAdd() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSave = (values: RewardAssignmentFormProps) => {
    const id = uuidv4();
    const newRewardAssignment: IRewardAssignment = {
      id,
      createdAt: new Date().toISOString(),
      ...values,
    } as IRewardAssignment;

    dispatch(
      addRewardAssignment({
        entity: newRewardAssignment,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBgImage>
      <RewardForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBgImage>
  );
}

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import bgImgSrc from '~/assets/img/bg.png';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { BaseRewardForm } from '~/components/rewards/RewardForm';
import { addRewardBase } from '~/store/rewardBase/slice';
import { EFormMode } from '~/types/ECommon';
import { IRewardBase, RewardBaseFormProps } from '~/types/IReward';

export default function BaseRewardAdd() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSave = (values: RewardBaseFormProps) => {
    const id = uuidv4();
    const newRewardBase: IRewardBase = {
      id,
      createdAt: new Date().toISOString(),
      ...values,
    } as IRewardBase;

    dispatch(
      addRewardBase({
        entity: newRewardBase,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <BaseRewardForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBackground>
  );
}

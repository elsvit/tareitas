import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import bgImgSrc from '~/assets/img/bg.png';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { BaseRewardForm } from '~/components/rewards/RewardForm';
import { selectRewardBaseById } from '~/store/rewardBase/selectors';
import { updateRewardBase } from '~/store/rewardBase/slice';
import { EFormMode } from '~/types/ECommon';
import { IRewardBase, RewardBaseFormProps } from '~/types/IReward';

export default function BaseRewardEdit() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { params } = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const { id } = params;

  const reward = useSelector(selectRewardBaseById(id));

  const handleSave = (values: RewardBaseFormProps) => {
    dispatch(
      updateRewardBase({
        entity: {
          id,
          updatedAt: new Date().toISOString(),
          ...values,
        } as IRewardBase,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <BaseRewardForm
        mode={EFormMode.Edit}
        reward={reward}
        onSave={handleSave}
      />
    </SafeAreaBackground>
  );
}

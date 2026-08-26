import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { RewardForm } from '~/components/rewards/RewardForm';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { selectRewardAssignmentById } from '~/store/rewardAssignment/selectors';
import { updateRewardAssignment } from '~/store/rewardAssignment/slice';
import { EFormMode } from '~/types/ECommon';
import { EMainTabs } from '~/types/ENavigation';
import { IRewardAssignment, RewardAssignmentFormProps } from '~/types/IReward';

export default function RewardEdit() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { params } = useRoute<RouteProp<Record<string, { id?: string }>, string>>();
  const rewardId = params?.id ?? '';
  const reward = useSelector(selectRewardAssignmentById(rewardId));

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.LOADING][updateRewardAssignment.type] ?? false;
  });

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][updateRewardAssignment.type]?.message ?? null
    );
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
    }
  }, [saveError]);

  const handleSave = (values: RewardAssignmentFormProps) => {
    if (!reward || isSaving) {
      return;
    }

    setSubmitError(null);

    const updatedReward: IRewardAssignment = {
      ...reward,
      updatedAt: new Date().toISOString(),
      ...values,
    };

    dispatch(
      updateRewardAssignment({
        entity: updatedReward,
        onSuccess: () => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace(`/${EMainTabs.Rewards}` as any);
        },
      }),
    );
  };

  if (!reward) {
    return null;
  }

  return (
    <SafeAreaBgImage>
      <RewardForm
        mode={EFormMode.Edit}
        reward={reward}
        onSave={handleSave}
        submitError={submitError}
        isSubmitting={isSaving}
      />
    </SafeAreaBgImage>
  );
}

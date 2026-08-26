import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { RewardForm } from '~/components/rewards/RewardForm';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { addRewardAssignment } from '~/store/rewardAssignment/slice';
import { EFormMode } from '~/types/ECommon';
import { EMainTabs } from '~/types/ENavigation';
import { IRewardAssignment, RewardAssignmentFormProps } from '~/types/IReward';

export default function RewardAdd() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.LOADING][addRewardAssignment.type] ?? false;
  });

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][addRewardAssignment.type]?.message ?? null
    );
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
    }
  }, [saveError]);

  const handleSave = (values: RewardAssignmentFormProps) => {
    if (isSaving) {
      return;
    }

    setSubmitError(null);

    const id = uuidv4();
    const newRewardAssignment: IRewardAssignment = {
      id,
      createdAt: new Date().toISOString(),
      ...values,
    } as IRewardAssignment;

    dispatch(
      addRewardAssignment({
        entity: newRewardAssignment,
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

  return (
    <SafeAreaBgImage>
      <RewardForm
        mode={EFormMode.Add}
        onSave={handleSave}
        submitError={submitError}
        isSubmitting={isSaving}
      />
    </SafeAreaBgImage>
  );
}

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { RewardForm } from '~/components/rewards/RewardForm';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { selectAllRewardAssignment } from '~/store/rewardAssignment/selectors';
import { addRewardAssignmentsBatch } from '~/store/rewardAssignment/slice';
import { isDuplicateRewardAssignmentForChild } from '~/store/rewards/rewardCalculations';
import { store } from '~/store/store';
import { EFormMode } from '~/types/ECommon';
import { EMainTabs } from '~/types/ENavigation';
import { IRewardAssignment, RewardAssignmentFormProps } from '~/types/IReward';

export default function RewardAdd() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState(false);

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.LOADING][addRewardAssignmentsBatch.type] ?? false
    );
  });

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][addRewardAssignmentsBatch.type]?.message ??
      null
    );
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
      setPendingNavigation(false);
    }
  }, [saveError]);

  useEffect(() => {
    if (!pendingNavigation || isSaving || saveError) {
      return;
    }

    setPendingNavigation(false);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/(tabs)/${EMainTabs.Rewards}`);
    }
  }, [isSaving, pendingNavigation, router, saveError]);

  const handleSave = (valuesList: RewardAssignmentFormProps[]) => {
    if (valuesList.length === 0 || isSaving) {
      return;
    }

    setSubmitError(null);

    const existingAssignments = selectAllRewardAssignment(store.getState());
    const uniqueValues = valuesList.filter(
      values => !isDuplicateRewardAssignmentForChild(existingAssignments, values),
    );

    if (uniqueValues.length === 0) {
      return;
    }

    const newRewardAssignments = uniqueValues.map(values => {
      const id = uuidv4();

      return {
        id,
        createdAt: new Date().toISOString(),
        ...values,
      } as IRewardAssignment;
    });

    dispatch(
      addRewardAssignmentsBatch({
        entities: newRewardAssignments,
        onSuccess: () => {
          setPendingNavigation(true);
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

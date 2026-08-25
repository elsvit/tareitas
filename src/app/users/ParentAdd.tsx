import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { addParent } from '~/store/parents/slice';
import { selectCurrentUser } from '~/store/settings/selectors';
import { EFormMode } from '~/types/ECommon';
import { IParent, ParentFormProps } from '~/types/IParent';

export default function ParentAdd() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.ERROR][addParent.type]?.message ?? null;
  });

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.LOADING][addParent.type] ?? false;
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
    }
  }, [saveError]);

  const handleSave = (user: ParentFormProps) => {
    setSubmitError(null);

    const id = uuidv4();
    const newUser: IParent = {
      id,
      createdAt: new Date().toISOString(),
      createdBy: currentUser ?? id,
      ...user,
    } as IParent;

    dispatch(
      addParent({
        entity: newUser,
        onSuccess: () => {
          if (router.canGoBack()) {
            router.back();
          }
        },
      }),
    );
  };

  return (
    <SafeAreaBgImage>
      <ParentForm
        mode={EFormMode.Add}
        onSave={handleSave}
        showUniqueUsername
        submitError={submitError}
        isSubmitting={isSaving}
      />
    </SafeAreaBgImage>
  );
}

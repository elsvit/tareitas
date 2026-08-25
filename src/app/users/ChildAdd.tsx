import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { RootStateT } from '~/store';
import { addChild } from '~/store/children/slice';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { selectCurrentUser, selectIsAdmin } from '~/store/settings/selectors';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps, IChild } from '~/types/IChild';

export default function ChildAdd() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.ERROR][addChild.type]?.message ?? null;
  });

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.LOADING][addChild.type] ?? false;
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
    }
  }, [saveError]);

  useEffect(() => {
    if (!isAdmin) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/users/Users');
      }
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  const handleSave = (user: ChildFormProps) => {
    setSubmitError(null);

    const id = uuidv4();
    const newUser: IChild = {
      id,
      createdAt: new Date().toISOString(),
      createdBy: currentUser ?? id,
      ...user,
    } as IChild;

    dispatch(
      addChild({
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
      <ChildForm
        mode={EFormMode.Add}
        onSave={handleSave}
        showUniqueUsername
        submitError={submitError}
        isSubmitting={isSaving}
      />
    </SafeAreaBgImage>
  );
}

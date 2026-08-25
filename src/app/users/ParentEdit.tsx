import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { updateParent } from '~/store/parents';
import { selectParentById } from '~/store/parents/selectors';
import { EFormMode } from '~/types/ECommon';
import { IParent, ParentFormProps } from '~/types/IParent';

export default function ParentEdit() {
  const dispatch = useDispatch();
  const router = useRouter();
  const route = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const userId = route.params?.id;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const parent = useSelector((state: RootStateT) =>
    userId ? selectParentById(state, userId) : undefined,
  );

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.ERROR][updateParent.type]?.message ?? null;
  });

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.LOADING][updateParent.type] ?? false;
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
    }
  }, [saveError]);

  const handleSave = (user: ParentFormProps) => {
    setSubmitError(null);

    const newUser: IParent = {
      ...parent,
      id: userId as string,
      updatedAt: new Date().toISOString(),
      ...user,
    } as IParent;

    dispatch(
      updateParent({
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
        mode={EFormMode.Edit}
        parent={parent}
        onSave={handleSave}
        submitError={submitError}
        isSubmitting={isSaving}
      />
    </SafeAreaBgImage>
  );
}

import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import type { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { updateChild } from '~/store/children/slice';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps, IChild } from '~/types/IChild';

export default function ChildEdit() {
  useI18nHeaderTitle('users.edit_child');

  const dispatch = useDispatch();
  const router = useRouter();
  const route = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const userId = route.params?.id;

  const child = useSelector((state: RootStateT) =>
    userId ? selectChildById(state, userId) : undefined,
  );

  const handleSave = (user: ChildFormProps) => {
    const newUser: IChild = {
      id: userId as string,
      updatedAt: new Date().toISOString(),
      ...user,
    } as IChild;

    dispatch(
      updateChild({
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
    <SafeAreaBackground>
      <ChildForm mode={EFormMode.Edit} child={child} onSave={handleSave} />
    </SafeAreaBackground>
  );
}

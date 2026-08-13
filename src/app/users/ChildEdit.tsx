import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import type { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { updateChild } from '~/store/children/slice';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps, IChild } from '~/types/IChild';

export default function ChildEdit() {
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
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBgImage>
      <ChildForm mode={EFormMode.Edit} child={child} onSave={handleSave} />
    </SafeAreaBgImage>
  );
}

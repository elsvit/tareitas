import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { RootStateT } from '~/store';
import { updateParent } from '~/store/parents';
import { selectParentById } from '~/store/parents/selectors';
import { EFormMode } from '~/types/ECommon';
import { IParent, ParentFormProps } from '~/types/IParent';

export default function ParentEdit() {
  const dispatch = useDispatch();
  const router = useRouter();
  const route = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const userId = route.params?.id;

  const parent = useSelector((state: RootStateT) =>
    userId ? selectParentById(state, userId) : undefined,
  );

  const handleSave = (user: ParentFormProps) => {
    const newUser: IParent = {
      id: userId as string,
      updatedAt: new Date().toISOString(),
      ...user,
    } as IParent;

    dispatch(
      updateParent({
        entity: newUser,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBgImage>
      <ParentForm mode={EFormMode.Edit} parent={parent} onSave={handleSave} />
    </SafeAreaBgImage>
  );
}

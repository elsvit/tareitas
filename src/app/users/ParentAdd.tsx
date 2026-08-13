import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { addParent } from '~/store/parents/slice';
import { EFormMode } from '~/types/ECommon';
import { IParent, ParentFormProps } from '~/types/IParent';

export default function ParentAdd() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSave = (user: ParentFormProps) => {
    const id = uuidv4();
    const newUser: IParent = {
      id,
      createdAt: new Date().toISOString(),
      ...user,
    } as IParent;

    dispatch(
      addParent({
        entity: newUser,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBgImage>
      <ParentForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBgImage>
  );
}

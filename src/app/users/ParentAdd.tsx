import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { addParent } from '~/store/parents/slice';
import { EFormMode } from '~/types/ECommon';
import { IParent, ParentFormProps } from '~/types/IParent';

export default function ParentAdd() {
  useI18nHeaderTitle('users.add_parent');

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
      {
        onSuccess: () => {
          if (router.canGoBack()) {
            router.back();
          }
        },
      },
    );
  };

  return (
    <SafeAreaBackground>
      <ParentForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBackground>
  );
}

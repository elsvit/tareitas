import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { addChild } from '~/store/children/slice';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps, IChild } from '~/types/IChild';

export default function ChildAdd() {
  useI18nHeaderTitle('users.add_child');

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSave = (user: ChildFormProps) => {
    const id = uuidv4();
    const newUser: IChild = {
      id,
      createdAt: new Date().toISOString(),
      ...user,
    } as IChild;

    dispatch(
      addChild({
        entity: newUser,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBackground>
      <ChildForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBackground>
  );
}

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { addChild } from '~/store/children/slice';
import { selectIsAdmin } from '~/store/settings/selectors';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps, IChild } from '~/types/IChild';

export default function ChildAdd() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAdmin = useSelector(selectIsAdmin);

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
    const id = uuidv4();
    const newUser: IChild = {
      id,
      createdAt: new Date().toISOString(),
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
      <ChildForm mode={EFormMode.Add} onSave={handleSave} showUniqueUsername />
    </SafeAreaBgImage>
  );
}

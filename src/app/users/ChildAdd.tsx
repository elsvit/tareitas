import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import bgImgSrc from '~/assets/img/bg.png';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { addChild } from '~/store/children/slice';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps, IChild } from '~/types/IChild';

export default function ChildAdd() {
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
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <ChildForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBackground>
  );
}

import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { BaseTaskForm } from '~/components/tasks/TaskForm/BaseTaskForm';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { selectTaskBaseById } from '~/store/taskBase/selectors';
import { updateTaskBase } from '~/store/taskBase/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskBase, TaskBaseFormProps } from '~/types/ITask';

export default function BaseTaskEdit() {
  useI18nHeaderTitle('tasks.edit_base_task');

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    params,
  } = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const { id } = params;

  const task = useSelector(selectTaskBaseById(params.id));

  const handleSave = (values: TaskBaseFormProps) => {
    dispatch(
      updateTaskBase({
        entity: {
          id,
          updatedAt: new Date().toISOString(),
          ...values,
        } as ITaskBase,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBackground>
      <BaseTaskForm
        mode={EFormMode.Edit}
        task={task}
        onSave={handleSave}
      />
    </SafeAreaBackground>
  );
}
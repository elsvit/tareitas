import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { BaseTaskForm } from '~/components/tasks/TaskForm/BaseTaskForm';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { addTaskBase } from '~/store/taskBase/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskBase, TaskBaseFormProps } from '~/types/ITask';

export default function BaseTaskAdd() {
  useI18nHeaderTitle('tasks.add_base_task');

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSave = (taskBase: TaskBaseFormProps) => {

    const id = uuidv4();
    const newTaskBase: ITaskBase = {
      id,
      createdAt: new Date().toISOString(),
      ...taskBase,
    } as ITaskBase;

    dispatch(
      addTaskBase({
        entity: newTaskBase,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBackground>
      <BaseTaskForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBackground>
  );
}

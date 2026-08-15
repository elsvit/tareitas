import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { BaseTaskForm } from '~/components/tasks/TaskForm/BaseTaskForm';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { addTaskBase } from '~/store/taskBase/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskBase, TaskBaseFormProps } from '~/types/ITask';

export default function BaseTaskAdd() {
  const dispatch = useDispatch();

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
  };

  return (
    <SafeAreaBgImage>
      <BaseTaskForm mode={EFormMode.Add} onSave={handleSave} />
    </SafeAreaBgImage>
  );
}

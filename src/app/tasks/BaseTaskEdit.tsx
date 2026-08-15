import { RouteProp, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { BaseTaskForm } from '~/components/tasks/TaskForm/BaseTaskForm';
import { selectTaskBaseById } from '~/store/taskBase/selectors';
import { updateTaskBase } from '~/store/taskBase/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskBase, TaskBaseFormProps } from '~/types/ITask';

export default function BaseTaskEdit() {
  const dispatch = useDispatch();

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
  };

  return (
    <SafeAreaBgImage>
      <BaseTaskForm
        mode={EFormMode.Edit}
        task={task}
        onSave={handleSave}
      />
    </SafeAreaBgImage>
  );
}

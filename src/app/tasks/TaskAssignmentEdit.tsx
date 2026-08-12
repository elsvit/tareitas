import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { updateTaskAssignment } from '~/store/taskAssignment/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';

export default function TaskAssignmentEdit() {
  useI18nHeaderTitle('tasks.edit_task');

  const dispatch = useDispatch();
  const router = useRouter();

  const { params } = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const { id } = params;

  const assignment = useSelector(selectTaskAssignmentById(id));

  const handleSave = (values: TaskAssignmentFormProps) => {
    dispatch(
      updateTaskAssignment({
        entity: {
          id,
          updatedAt: new Date().toISOString(),
          ...values,
        } as ITaskAssignment,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <AssignmentTaskForm
      mode={EFormMode.Edit}
      assignment={assignment}
      isRoutine={assignment?.isRoutine}
      onSave={handleSave}
    />
  );
}

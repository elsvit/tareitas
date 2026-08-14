import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { t } from '~/services';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { updateTaskAssignment } from '~/store/taskAssignment/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';

export default function TaskAssignmentEdit() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { params } = useRoute<
    RouteProp<Record<string, { id: string; isHabit?: string }>, string>
  >();
  const { id } = params;
  const isHabitFromRoute = params?.isHabit === 'true';

  const assignment = useSelector(selectTaskAssignmentById(id));
  const isHabit = assignment?.isHabit ?? isHabitFromRoute;

  const handleSave = (valuesList: TaskAssignmentFormProps[]) => {
    const values = valuesList[0];

    if (!values) {
      return;
    }

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
      isHabit={isHabit}
      title={isHabit ? t('habits.edit_habit') : undefined}
      onSave={handleSave}
    />
  );
}

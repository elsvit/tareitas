import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { addTaskAssignment } from '~/store/taskAssignment/slice';
import {
  addGeneratedTask,
  generateTasksForDate,
} from '~/store/tasks/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';

export default function TaskAssignmentAdd() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { params } = useRoute<
    RouteProp<Record<string, { date?: string; isHabit?: string }>, string>
  >();

  const selectedDate = params?.date;
  const isHabit = params?.isHabit === 'true';
  const assignments = useSelector(selectAllTaskAssignment);

  const handleSave = (values: TaskAssignmentFormProps) => {
    const id = uuidv4();
    const calendarDate = selectedDate ?? values.startDate;

    const newAssignment: ITaskAssignment = {
      id,
      createdAt: new Date().toISOString(),
      ...values,
    } as ITaskAssignment;

    dispatch(
      addTaskAssignment({
        entity: newAssignment,
      }),
    );

    dispatch(
      generateTasksForDate({
        date: calendarDate,
        assignments: [...assignments, newAssignment],
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <AssignmentTaskForm
      mode={EFormMode.Add}
      defaultDate={selectedDate}
      isHabit={isHabit}
      onSave={handleSave}
    />
  );
}

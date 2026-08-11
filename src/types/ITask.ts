import { WeekDay } from './ECommon';
import { ETaskRepeatType, ETaskStatus } from './ETask';

export interface ITaskBase extends Partial<CreatedProps> {
  id: string;
  name: string;
  description?: string;
  reward?: number;
  icon?: string;
  picture?: string;
}

export type TaskBaseFormProps = OmitCreatedKeys<ITaskBase>;


export interface ITaskAssignment extends CreatedProps {
  id: string;
  taskBaseId: string;
  childId: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  time: string; // HH:mm
  repeatWeekDays?: WeekDay[];
  repeatType?: ETaskRepeatType;
  repeatInterval?: number; // 1..., if undefined = 1, e.g.: repeat every 2 weeks
  newTaskBonus?: number;
  newTaskDuration?: number; // in days
}

export interface ITask extends CreatedProps {
  id: string; // task id
  assignmentId: string; // rule: one day only one the same assignmentId
  date: string; // specific YYYY-MM-DD
  status: ETaskStatus;
}

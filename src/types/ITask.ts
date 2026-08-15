import { WeekDay } from './ECommon';
import { ETaskRepeatType, ETaskStatus } from './ETask';

export interface ITaskBase extends Partial<CreatedProps> {
  id: string;
  name: string;
  description?: string;
  reward?: number;
  picture?: string;
}

export type TaskBaseFormProps = OmitCreatedKeys<ITaskBase>;

export type TaskAssignmentFormProps = OmitCreatedKeys<ITaskAssignment>;

export interface ISubtask {
  value: string;
  label: string;
}
export interface ITaskAssignment extends CreatedProps {
  id: string;
  childId: string;
  title: string;
  description?: string;
  reward?: number;
  picture?: string;
  color?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  time: string; // HH:mm approximately, usually for sorting tasks
  isHabit?: boolean; // for Habits screen, every day habit tasks
  repeat?: {
    type: ETaskRepeatType; // e.g. day, week, month
    weekDays?: WeekDay[]; // for day type
    count?: number; //for week or month: 1..., if undefined = 1, e.g.: repeat 2 times per week
  };
  // repeatWeekDays?: WeekDay[];
  // repeatType?: ETaskRepeatType; // e.g. day, week, month
  // repeatCount?: number; //for week or month: 1..., if undefined = 1, e.g.: repeat 2 times per week
  newTaskBonus?: number;
  newTaskDuration?: number; // in days or newTaskEndDate: string; // YYYY-MM-DD
  subtasks?: ISubtask[];
  changes?: {
    [date: string]: ITaskAssignmentChange;
  };
}

export interface ITaskAssignmentChange {
  time?: string;
  name?: string;
  description?: string;
  reward?: number;
  picture?: string;
  newTaskBonus?: number;
  newTaskDuration?: number;
}

// for currently showing task in the calendar and completed tasks in task store
export interface ITask extends Partial<CreatedProps> {
  id: string;
  assignmentId: string;
  date: string; // specific YYYY-MM-DD
  status: ETaskStatus;
  completedSubtasks?: string[];
}

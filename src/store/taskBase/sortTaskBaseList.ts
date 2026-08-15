import { getBaseTasks } from '~/constants/tasks';
import { ITaskBase } from '~/types/ITask';

export const sortTaskBaseList = (tasks: ITaskBase[]): ITaskBase[] => {
  const defaultOrder = new Map(
    getBaseTasks().map((task, index) => [task.id, index] as const),
  );

  const customTasks: ITaskBase[] = [];
  const defaultTasks: ITaskBase[] = [];

  tasks.forEach(task => {
    if (defaultOrder.has(task.id)) {
      defaultTasks.push(task);
    } else {
      customTasks.push(task);
    }
  });

  customTasks.sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;

    return bTime - aTime;
  });

  defaultTasks.sort(
    (a, b) => (defaultOrder.get(a.id) ?? 0) - (defaultOrder.get(b.id) ?? 0),
  );

  return [...customTasks, ...defaultTasks];
};

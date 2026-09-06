import { z } from 'zod';

import { SUBTASK_MAXIMUM } from '~/constants/tasks';
import { t } from '~/services';

export function canAddSubtask(currentCount: number): boolean {
  return currentCount < SUBTASK_MAXIMUM;
}

export function getSubtasksMaximumMessage(): string {
  return (
    t('tasks.subtasks_maximum', { maximum: SUBTASK_MAXIMUM }) ||
    `Maximum ${SUBTASK_MAXIMUM} subtasks allowed`
  );
}

export function refineSubtasksField(
  values: {
    withSubtasks: boolean;
    subtasks: Array<{ label: string }>;
  },
  ctx: z.RefinementCtx,
  requiredMessage = t('tasks.subtasks_required') || 'Add at least one subtask',
) {
  if (!values.withSubtasks) {
    return;
  }

  if (values.subtasks.length > SUBTASK_MAXIMUM) {
    ctx.addIssue({
      code: 'custom',
      message: getSubtasksMaximumMessage(),
      path: ['subtasks'],
    });
    return;
  }

  const hasValidSubtask = values.subtasks.some(
    subtask => subtask.label.trim().length > 0,
  );

  if (!hasValidSubtask) {
    ctx.addIssue({
      code: 'custom',
      message: requiredMessage,
      path: ['subtasks'],
    });
  }
}

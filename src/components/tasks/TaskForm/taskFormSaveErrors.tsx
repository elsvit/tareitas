import React, { useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';

import { Space, Text } from '~/components/ui';
import { t } from '~/services';

import { styles } from './styles';

function fieldErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return undefined;
}

export function buildTaskFormErrorSummary(
  errors: FieldErrors,
  fieldLabels: Record<string, () => string>,
): string[] {
  const lines: string[] = [];

  for (const [field, label] of Object.entries(fieldLabels)) {
    const message = fieldErrorMessage(errors[field]);

    if (message) {
      lines.push(`${label()}: ${message}`);
    }
  }

  return lines;
}

const ASSIGNMENT_TASK_FIELD_LABELS: Record<string, () => string> = {
  childIds: () => t('users.children'),
  title: () => t('common.title'),
  reward: () => t('tasks.reward'),
  color: () => t('users.color'),
  startDate: () => t('tasks.start_date'),
  endDate: () => t('tasks.end_date'),
  time: () => t('common.time'),
  weekDays: () => t('tasks.repeats'),
  subtasks: () => t('tasks.subtasks'),
  newTaskBonus: () => t('tasks.new_task_bonus'),
  newTaskDuration: () => t('tasks.new_task_duration'),
};

const BASE_TASK_FIELD_LABELS: Record<string, () => string> = {
  name: () => t('common.title'),
  reward: () => t('tasks.reward'),
  picture: () => t('users.avatar'),
  color: () => t('users.color'),
  subtasks: () => t('tasks.subtasks'),
};

type TaskFormSaveErrorsProps = {
  errors: FieldErrors;
  submitCount: number;
  variant: 'assignment' | 'base';
};

export function TaskFormSaveErrors({
  errors,
  submitCount,
  variant,
}: TaskFormSaveErrorsProps) {
  const fieldLabels =
    variant === 'assignment'
      ? ASSIGNMENT_TASK_FIELD_LABELS
      : BASE_TASK_FIELD_LABELS;

  const lines = useMemo(
    () => buildTaskFormErrorSummary(errors, fieldLabels),
    [errors, fieldLabels],
  );

  if (submitCount === 0 || lines.length === 0) {
    return null;
  }

  return (
    <>
      <Space size={2} />
      {lines.map(line => (
        <Text key={line} style={styles.errorText}>
          {line}
        </Text>
      ))}
    </>
  );
}

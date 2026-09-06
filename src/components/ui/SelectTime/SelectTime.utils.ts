import { format, isValid, parse } from 'date-fns';

export type SelectTimeProps = {
  label?: string;
  value?: string;
  onChange: (time: string) => void;
};

const DEFAULT_TIME = '09:00';

export const timeStringToDate = (value?: string): Date => {
  const timeValue = value || DEFAULT_TIME;
  const parsed = parse(timeValue, 'HH:mm', new Date());

  if (!isValid(parsed)) {
    return parse(DEFAULT_TIME, 'HH:mm', new Date());
  }

  return parsed;
};

export const dateToTimeString = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const normalizeTimeString = (value?: string): string => {
  if (!value?.trim()) {
    return DEFAULT_TIME;
  }

  const trimmed = value.trim();
  let parsed = parse(trimmed, 'HH:mm', new Date());

  if (!isValid(parsed)) {
    parsed = parse(trimmed, 'H:mm', new Date());
  }

  if (!isValid(parsed)) {
    return trimmed;
  }

  return format(parsed, 'HH:mm');
};

export const formatTimeLabel = (value?: string): string => {
  if (!value) {
    return '';
  }

  const normalized = normalizeTimeString(value);

  return normalized;
};

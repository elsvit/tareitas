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

export const formatTimeLabel = (value?: string): string => {
  if (!value) {
    return '';
  }

  const parsed = parse(value, 'HH:mm', new Date());

  if (!isValid(parsed)) {
    return value;
  }

  return format(parsed, 'HH:mm');
};

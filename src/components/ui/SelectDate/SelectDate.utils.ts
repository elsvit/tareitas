import { format, isValid, parseISO } from 'date-fns';

export type SelectDateProps = {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
};

export const dateStringToDate = (value?: string): Date => {
  if (!value) {
    return new Date();
  }

  const parsed = parseISO(value);

  if (!isValid(parsed)) {
    return new Date();
  }

  return parsed;
};

export const dateToString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateLabel = (value?: string): string => {
  if (!value) {
    return '';
  }

  const parsed = parseISO(value);

  if (!isValid(parsed)) {
    return value;
  }

  return format(parsed, 'yyyy-MM-dd');
};

import { format, isValid, parseISO } from 'date-fns';

export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCalendarDateString(
  value: string | null | undefined,
): value is string {
  if (!value?.trim() || !CALENDAR_DATE_PATTERN.test(value.trim())) {
    return false;
  }

  return isValid(parseISO(value.trim()));
}

export function resolveCalendarDateString(
  value: string | null | undefined,
): string {
  return isValidCalendarDateString(value)
    ? value.trim()
    : getTodayDateString();
}

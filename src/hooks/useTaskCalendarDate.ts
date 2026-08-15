import { addDays, format, parseISO, subDays } from 'date-fns';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectTaskCalendarDate } from '~/store/settings/selectors';
import { setTaskCalendarDate } from '~/store/settings/slice';

export function useTaskCalendarDate() {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectTaskCalendarDate);

  const setSelectedDate = useCallback(
    (date: string | ((current: string) => string)) => {
      const nextDate =
        typeof date === 'function' ? date(selectedDate) : date;

      dispatch(setTaskCalendarDate(nextDate));
    },
    [dispatch, selectedDate],
  );

  const handlePreviousDay = useCallback(() => {
    setSelectedDate(current =>
      format(subDays(parseISO(current), 1), 'yyyy-MM-dd'),
    );
  }, [setSelectedDate]);

  const handleNextDay = useCallback(() => {
    setSelectedDate(current =>
      format(addDays(parseISO(current), 1), 'yyyy-MM-dd'),
    );
  }, [setSelectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    handlePreviousDay,
    handleNextDay,
  };
}

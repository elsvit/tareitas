export const compareTaskTimes = (timeA?: string, timeB?: string): number => {
  const toMinutes = (time?: string): number => {
    if (!time) {
      return Number.MAX_SAFE_INTEGER;
    }

    const [hoursPart, minutesPart] = time.split(':');
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return Number.MAX_SAFE_INTEGER;
    }

    return hours * 60 + minutes;
  };

  return toMinutes(timeA) - toMinutes(timeB);
};

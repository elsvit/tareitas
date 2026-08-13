import {
  IEarnedRewardPeriod,
  IEarnedRewardPeriodChildBalance,
  IEarnedRewardPeriodEntry,
  IEarnedRewardPeriods,
} from '~/types/IReward';

type LegacyNestedEarnedRewardPeriods = Record<
  string,
  Record<string, IEarnedRewardPeriodChildBalance>
>;

type FlatEarnedRewardPeriod = IEarnedRewardPeriodEntry;

export const isEarnedPeriodChildBalance = (
  value: unknown,
): value is IEarnedRewardPeriodChildBalance =>
  !!value &&
  typeof value === 'object' &&
  ((value as IEarnedRewardPeriodChildBalance).remainingRewardFromPreviousMonths ===
    null ||
    typeof (value as IEarnedRewardPeriodChildBalance)
      .remainingRewardFromPreviousMonths === 'number') &&
  typeof (value as IEarnedRewardPeriodChildBalance).monthReward === 'number';

export const isPeriodClosed = (
  balance: IEarnedRewardPeriodChildBalance,
): boolean => balance.remainingRewardFromPreviousMonths !== null;

export const isFlatEarnedRewardPeriod = (
  value: unknown,
): value is FlatEarnedRewardPeriod =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as FlatEarnedRewardPeriod).yearMonth === 'string' &&
  typeof (value as FlatEarnedRewardPeriod).childId === 'string' &&
  isEarnedPeriodChildBalance(value);

export const getChildBalanceFromPeriod = (
  period: IEarnedRewardPeriod | undefined,
  childId: string,
): IEarnedRewardPeriodChildBalance | undefined => {
  if (!period) {
    return undefined;
  }

  const value = period[childId];

  return isEarnedPeriodChildBalance(value) ? value : undefined;
};

export const createEarnedPeriodEntry = (
  childId: string,
  yearMonth: string,
  balance: IEarnedRewardPeriodChildBalance,
): IEarnedRewardPeriodEntry => ({
  childId,
  yearMonth,
  ...balance,
});

export const createEarnedPeriodForChild = (
  childId: string,
  yearMonth: string,
  balance?: Partial<IEarnedRewardPeriodChildBalance>,
): IEarnedRewardPeriod => ({
  yearMonth,
  [childId]: {
    remainingRewardFromPreviousMonths:
      balance?.remainingRewardFromPreviousMonths !== undefined
        ? balance.remainingRewardFromPreviousMonths
        : null,
    monthReward: balance?.monthReward ?? 0,
  },
});

const mergeFlatPeriods = (
  flatPeriods: FlatEarnedRewardPeriod[],
): IEarnedRewardPeriods => {
  const byYearMonth = new Map<string, IEarnedRewardPeriod>();

  flatPeriods.forEach(item => {
    const existing = byYearMonth.get(item.yearMonth) ?? {
      yearMonth: item.yearMonth,
    };

    existing[item.childId] = {
      remainingRewardFromPreviousMonths: item.remainingRewardFromPreviousMonths,
      monthReward: item.monthReward,
    };

    byYearMonth.set(item.yearMonth, existing);
  });

  return [...byYearMonth.values()].sort((a, b) =>
    a.yearMonth.localeCompare(b.yearMonth),
  );
};

const normalizeNestedObject = (
  periods: LegacyNestedEarnedRewardPeriods,
): IEarnedRewardPeriods =>
  Object.entries(periods).map(([yearMonth, childMap]) => ({
    yearMonth,
    ...childMap,
  }));

export const normalizeEarnedRewardPeriods = (
  periods: unknown,
): IEarnedRewardPeriods => {
  if (!periods) {
    return [];
  }

  if (Array.isArray(periods)) {
    if (periods.length === 0) {
      return [];
    }

    if (isFlatEarnedRewardPeriod(periods[0])) {
      return mergeFlatPeriods(periods as FlatEarnedRewardPeriod[]);
    }

    return (periods as IEarnedRewardPeriod[]).map(period => ({
      yearMonth: period.yearMonth,
      ...Object.fromEntries(
        Object.entries(period).filter(
          ([key, value]) =>
            key !== 'yearMonth' && isEarnedPeriodChildBalance(value),
        ),
      ),
    }));
  }

  if (typeof periods === 'object') {
    return normalizeNestedObject(periods as LegacyNestedEarnedRewardPeriods);
  }

  return [];
};

export const sortEarnedPeriods = (
  periods: IEarnedRewardPeriods,
): IEarnedRewardPeriods =>
  [...periods].sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

export const findEarnedPeriod = (
  periods: IEarnedRewardPeriods,
  childId: string,
  yearMonth: string,
): IEarnedRewardPeriodEntry | undefined => {
  const period = periods.find(item => item.yearMonth === yearMonth);
  const balance = getChildBalanceFromPeriod(period, childId);

  if (!balance) {
    return undefined;
  }

  return createEarnedPeriodEntry(childId, yearMonth, balance);
};

export const hasEarnedPeriod = (
  periods: IEarnedRewardPeriods,
  childId: string,
  yearMonth: string,
): boolean => !!findEarnedPeriod(periods, childId, yearMonth);

export const hasChildEarnedPeriods = (
  periods: IEarnedRewardPeriods,
  childId: string,
): boolean =>
  periods.some(period => !!getChildBalanceFromPeriod(period, childId));

export const getLastClosedPeriod = (
  periods: IEarnedRewardPeriods,
  childId: string,
): IEarnedRewardPeriodEntry | null => {
  let latest: IEarnedRewardPeriodEntry | null = null;

  periods.forEach(period => {
    const balance = getChildBalanceFromPeriod(period, childId);

    if (!balance || !isPeriodClosed(balance)) {
      return;
    }

    const entry = createEarnedPeriodEntry(childId, period.yearMonth, balance);

    if (!latest || entry.yearMonth > latest.yearMonth) {
      latest = entry;
    }
  });

  return latest;
};

export const getLastApprovedPeriod = getLastClosedPeriod;

export const getLastApprovedMonth = (
  periods: IEarnedRewardPeriods,
  childId: string,
): string | null => getLastClosedPeriod(periods, childId)?.yearMonth ?? null;

export const getApprovedPeriodBalance = (
  period: IEarnedRewardPeriodEntry | null | undefined,
): number => {
  if (!period) {
    return 0;
  }

  const remaining = period.remainingRewardFromPreviousMonths ?? 0;

  return remaining + period.monthReward;
};

export const upsertChildEarnedPeriod = (
  periods: IEarnedRewardPeriods,
  childId: string,
  yearMonth: string,
  update: Partial<IEarnedRewardPeriodChildBalance>,
) => {
  const index = periods.findIndex(period => period.yearMonth === yearMonth);
  const existingBalance =
    index >= 0
      ? getChildBalanceFromPeriod(periods[index], childId)
      : undefined;

  const nextBalance: IEarnedRewardPeriodChildBalance = {
    remainingRewardFromPreviousMonths:
      update.remainingRewardFromPreviousMonths !== undefined
        ? update.remainingRewardFromPreviousMonths
        : existingBalance?.remainingRewardFromPreviousMonths ?? null,
    monthReward: update.monthReward ?? existingBalance?.monthReward ?? 0,
  };

  if (index < 0) {
    periods.push(createEarnedPeriodForChild(childId, yearMonth, nextBalance));
  } else {
    periods[index] = {
      ...periods[index],
      [childId]: nextBalance,
    };
  }

  periods.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
};

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
): boolean => balance.isPeriodApproved === true;

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
    isPeriodApproved: balance?.isPeriodApproved,
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
      isPeriodApproved: item.isPeriodApproved,
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

const getChildIdsFromPeriods = (
  periods: IEarnedRewardPeriods,
): string[] => {
  const childIds = new Set<string>();

  periods.forEach(period => {
    Object.entries(period).forEach(([key, value]) => {
      if (key !== 'yearMonth' && isEarnedPeriodChildBalance(value)) {
        childIds.add(key);
      }
    });
  });

  return [...childIds];
};

/** Fix legacy sync placeholder that marked the first month as closed. */
const migrateLegacyPeriodApprovalFlags = (
  periods: IEarnedRewardPeriods,
): IEarnedRewardPeriods => {
  getChildIdsFromPeriods(periods).forEach(childId => {
    const childPeriods = periods
      .map(period => ({
        period,
        balance: getChildBalanceFromPeriod(period, childId),
      }))
      .filter(
        (
          item,
        ): item is {
          period: IEarnedRewardPeriod;
          balance: IEarnedRewardPeriodChildBalance;
        } => !!item.balance,
      )
      .sort((a, b) => a.period.yearMonth.localeCompare(b.period.yearMonth));

    const hasExplicitApproval = childPeriods.some(
      ({ balance }) => balance.isPeriodApproved === true,
    );

    if (hasExplicitApproval) {
      return;
    }

    const legacyClosedMonths = childPeriods.filter(
      ({ balance }) => balance.remainingRewardFromPreviousMonths !== null,
    );

    if (legacyClosedMonths.length === 0) {
      return;
    }

    if (legacyClosedMonths.length === 1) {
      const [{ period, balance }] = legacyClosedMonths;

      period[childId] = {
        remainingRewardFromPreviousMonths: null,
        monthReward: balance.monthReward,
      };
      return;
    }

    legacyClosedMonths.forEach(({ period, balance }) => {
      period[childId] = {
        ...balance,
        isPeriodApproved: true,
      };
    });
  });

  return periods;
};

export const normalizeEarnedRewardPeriods = (
  periods: unknown,
): IEarnedRewardPeriods => {
  if (!periods) {
    return [];
  }

  let normalized: IEarnedRewardPeriods;

  if (Array.isArray(periods)) {
    if (periods.length === 0) {
      return [];
    }

    if (isFlatEarnedRewardPeriod(periods[0])) {
      normalized = mergeFlatPeriods(periods as FlatEarnedRewardPeriod[]);
    } else {
      normalized = (periods as IEarnedRewardPeriod[]).map(period => ({
        yearMonth: period.yearMonth,
        ...Object.fromEntries(
          Object.entries(period).filter(
            ([key, value]) =>
              key !== 'yearMonth' && isEarnedPeriodChildBalance(value),
          ),
        ),
      }));
    }
  } else if (typeof periods === 'object') {
    normalized = normalizeNestedObject(periods as LegacyNestedEarnedRewardPeriods);
  } else {
    return [];
  }

  return migrateLegacyPeriodApprovalFlags(normalized);
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

export const isDateInClosedRewardPeriod = (
  periods: IEarnedRewardPeriods,
  childId: string,
  date: string,
): boolean => {
  const taskYearMonth = date.slice(0, 7);
  const period = periods.find(item => item.yearMonth === taskYearMonth);
  const balance = getChildBalanceFromPeriod(period, childId);

  if (balance?.isPeriodApproved === true) {
    return true;
  }

  const lastClosedMonth = getLastApprovedMonth(periods, childId);

  if (!lastClosedMonth) {
    return false;
  }

  return taskYearMonth <= lastClosedMonth;
};

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
    isPeriodApproved:
      update.isPeriodApproved !== undefined
        ? update.isPeriodApproved
        : existingBalance?.isPeriodApproved,
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

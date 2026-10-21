import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { RootStateT } from '~/store';
import { syncEarnedRewardPeriodsFromState } from '~/store/rewards/rewardCalculations';
import { syncEarnedRewardPeriods } from '~/store/rewards/slice';
import { selectTaskEntities } from '~/store/tasks/selectors';

const EARN_PERIODS_DEBOUNCE_MS = 80;

export const useSyncEarnedRewardPeriods = () => {
  const dispatch = useDispatch();
  const store = useStore<RootStateT>();
  const isFocused = useIsFocused();
  const taskEntities = useSelector(selectTaskEntities);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const periods = syncEarnedRewardPeriodsFromState(store.getState());

      dispatch(syncEarnedRewardPeriods(periods));
    }, EARN_PERIODS_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [dispatch, isFocused, store, taskEntities]);
};

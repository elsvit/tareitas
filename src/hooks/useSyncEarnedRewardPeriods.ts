import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { RootStateT } from '~/store';
import { syncEarnedRewardPeriodsFromState } from '~/store/rewards/rewardCalculations';
import { syncEarnedRewardPeriods } from '~/store/rewards/slice';
import { selectTaskEntities } from '~/store/tasks/selectors';

export const useSyncEarnedRewardPeriods = () => {
  const dispatch = useDispatch();
  const store = useStore<RootStateT>();
  const taskEntities = useSelector(selectTaskEntities);

  useEffect(() => {
    const periods = syncEarnedRewardPeriodsFromState(store.getState());

    dispatch(syncEarnedRewardPeriods(periods));
  }, [dispatch, store, taskEntities]);
};

import { IEarnedRewardPeriods } from '~/types/IReward';

import { apiFetch, parseApiJson } from './client';

type EarnedRewardPeriodsResponse = {
  periods: IEarnedRewardPeriods;
};

export async function getFamilyEarnedRewardPeriods(
  token: string,
  familyId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/earned-reward-periods`,
    { token },
  );

  return parseApiJson<EarnedRewardPeriodsResponse>(response);
}

export async function putFamilyEarnedRewardPeriods(
  token: string,
  familyId: string,
  periods: IEarnedRewardPeriods,
) {
  const response = await apiFetch(
    `/families/${familyId}/earned-reward-periods`,
    {
      method: 'PUT',
      token,
      body: { periods },
    },
  );

  return parseApiJson<EarnedRewardPeriodsResponse>(response);
}

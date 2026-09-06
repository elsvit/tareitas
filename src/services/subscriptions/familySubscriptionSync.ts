import { setCachedIsPro } from '~/hooks/useIsPro';
import { setFamilySubscription } from '~/store/settings/slice';
import type { AppDispatch } from '~/store/store';
import type { IFamilySubscription } from '~/types/ISubscription';
import { isAdFreeSubscription } from '~/types/ISubscription';

export function applyFamilySubscriptionFromServer(
  dispatch: AppDispatch,
  subscription: IFamilySubscription | null | undefined,
) {
  const normalizedSubscription = subscription ?? null;

  dispatch(setFamilySubscription(normalizedSubscription));
  setCachedIsPro(isAdFreeSubscription(normalizedSubscription));
}

export function getServerSubscriptionEntitlementId(
  subscription: IFamilySubscription | null | undefined,
): string | null {
  return subscription?.entitlementId ?? null;
}

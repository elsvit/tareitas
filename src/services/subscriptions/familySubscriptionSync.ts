import type { IFamilySubscription } from '~/types/ISubscription';
import { setCachedIsPro } from '~/hooks/useIsPro';

export function applyFamilySubscriptionFromServer(
  subscription: IFamilySubscription | null | undefined,
) {
  setCachedIsPro(subscription?.isPro ?? false);
}

export function getServerSubscriptionEntitlementId(
  subscription: IFamilySubscription | null | undefined,
): string | null {
  return subscription?.entitlementId ?? null;
}

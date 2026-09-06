export type SubscriptionStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'GRACE_PERIOD'
  | 'PAUSED'
  | 'BILLING_ISSUE'
  | 'NONE';

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  GRACE_PERIOD: 'GRACE_PERIOD',
  PAUSED: 'PAUSED',
  BILLING_ISSUE: 'BILLING_ISSUE',
  NONE: 'NONE',
} as const satisfies Record<string, SubscriptionStatus>;

export function isAdFreeSubscription(
  subscription: IFamilySubscription | null | undefined,
): boolean {
  if (!subscription) {
    return false;
  }

  return (
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.GRACE_PERIOD
  );
}

export interface IFamilySubscription {
  subscriptionId: string;
  entitlementId: string;
  productId: string | null;
  store: string | null;
  status: SubscriptionStatus | string;
  isPro: boolean;
  willRenew: boolean;
  purchasedAt: string | null;
  expiresAt: string | null;
  revenueCatAppUserId: string;
}

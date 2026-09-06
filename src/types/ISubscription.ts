export type SubscriptionStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'GRACE_PERIOD'
  | 'PAUSED'
  | 'BILLING_ISSUE'
  | 'NONE';

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

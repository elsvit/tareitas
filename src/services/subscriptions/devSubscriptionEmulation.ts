import type { IFamilyDetails } from '~/types/IAuth';
import type { IFamilySubscription } from '~/types/ISubscription';
import { SubscriptionStatus } from '~/types/ISubscription';

const DEV_PRO_ADMIN_EMAILS = new Set([
  'test-empty-db-check@tareitas.net',
]);

function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? '';
}

export function isDevProAdminEmail(
  email: string | null | undefined,
): boolean {
  return DEV_PRO_ADMIN_EMAILS.has(normalizeEmail(email));
}

function familyHasDevProAdmin(
  family: Pick<IFamilyDetails, 'parents'>,
): boolean {
  return family.parents.some(parent =>
    isDevProAdminEmail(parent.email),
  );
}

export function resolveFamilySubscriptionForClient(
  family: Pick<IFamilyDetails, 'id' | 'parents'>,
  serverSubscription: IFamilySubscription | null | undefined,
): IFamilySubscription | null {
  if (!__DEV__ || !familyHasDevProAdmin(family)) {
    return serverSubscription ?? null;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  return {
    subscriptionId: 'dev-emulated-subscription',
    entitlementId: 'tareitas_pro',
    productId: 'dev_yearly',
    store: 'DEV',
    status: SubscriptionStatus.ACTIVE,
    isPro: true,
    willRenew: true,
    purchasedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revenueCatAppUserId: family.id,
  };
}

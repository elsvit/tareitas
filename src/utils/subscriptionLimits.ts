import { differenceInCalendarDays, parseISO } from 'date-fns';

import { START_SUBSCRIPTION_DAYS } from '~/constants/ads';

export function getDaysSinceInstall(
  appInstalledAt: string | null | undefined,
): number {
  if (!appInstalledAt) {
    return 0;
  }

  return Math.max(
    0,
    differenceInCalendarDays(new Date(), parseISO(appInstalledAt)),
  );
}

export function shouldEnforceFreeTierLimits(
  appInstalledAt: string | null | undefined,
): boolean {
  if (START_SUBSCRIPTION_DAYS <= 0) {
    return true;
  }

  return (
    getDaysSinceInstall(appInstalledAt) >= START_SUBSCRIPTION_DAYS
  );
}

export function hasProFeatureAccess(
  isPro: boolean,
  appInstalledAt: string | null | undefined,
): boolean {
  return isPro || !shouldEnforceFreeTierLimits(appInstalledAt);
}

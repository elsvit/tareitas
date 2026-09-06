import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { isRevenueCatNativeModuleAvailable } from '~/services/subscriptions/revenueCatInit';
import { getIsPro } from '~/services/subscriptions/revenueCatSubscription';
import { selectAppInstalledAt, selectIsAdFreeBySubscription } from '~/store/settings/selectors';
import { hasProFeatureAccess } from '~/utils/subscriptionLimits';

let cachedIsPro: boolean | null = null;
const listeners = new Set<(isPro: boolean) => void>();

export function setCachedIsPro(isPro: boolean) {
  cachedIsPro = isPro;
  listeners.forEach(listener => listener(isPro));
}

export function useIsPro() {
  const isAdFreeBySubscription = useSelector(
    selectIsAdFreeBySubscription,
  );
  const [isProFromClient, setIsProFromClient] = useState(
    cachedIsPro ?? false,
  );
  const [isChecking, setIsChecking] = useState(cachedIsPro == null);
  const isPro = isAdFreeBySubscription || isProFromClient;

  const refreshIsPro = useCallback(async () => {
    if (!isRevenueCatNativeModuleAvailable()) {
      setCachedIsPro(false);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    try {
      setCachedIsPro(await getIsPro());
    } catch {
      setCachedIsPro(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const listener = (value: boolean) => setIsProFromClient(value);

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (cachedIsPro == null) {
      void refreshIsPro();
    }
  }, [refreshIsPro]);

  return { isPro, isChecking, refreshIsPro };
}

export function useProFeatureAccess() {
  const { isPro } = useIsPro();
  const appInstalledAt = useSelector(selectAppInstalledAt);

  return hasProFeatureAccess(isPro, appInstalledAt);
}

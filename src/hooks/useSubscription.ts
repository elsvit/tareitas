import { useCallback, useEffect, useState } from 'react';

import { t } from '~/services';
import { isRevenueCatNativeModuleAvailable } from '~/services/subscriptions/revenueCatInit';
import { setCachedIsPro } from '~/hooks/useIsPro';
import {
  getIsPro,
  getYearlyPrice,
  purchaseYearly,
  restorePurchases,
  TAREITAS_PRO_ENTITLEMENT,
} from '~/services/subscriptions/revenueCatSubscription';

function isPurchaseCancelled(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'userCancelled' in error &&
      (error as { userCancelled?: boolean }).userCancelled,
  );
}

export function useSubscription() {
  const [yearlyPrice, setYearlyPrice] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAvailable = isRevenueCatNativeModuleAvailable();

  const refresh = useCallback(async () => {
    if (!isAvailable) {
      setIsPro(false);
      setYearlyPrice(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pro = await getIsPro();
      setIsPro(pro);
      setCachedIsPro(pro);

      if (!pro) {
        setYearlyPrice(await getYearlyPrice());
      } else {
        setYearlyPrice(null);
      }
    } catch {
      setError(t('subscription.unavailable'));
      setYearlyPrice(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    if (!isAvailable) {
      setError(t('subscription.unavailable'));
      return false;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      const result = await purchaseYearly();
      setIsPro(result.isPro);
      setCachedIsPro(result.isPro);
      return result.isPro;
    } catch (purchaseError) {
      if (!isPurchaseCancelled(purchaseError)) {
        setError(t('subscription.purchase_error'));
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isAvailable]);

  const restore = useCallback(async () => {
    if (!isAvailable) {
      setError(t('subscription.unavailable'));
      return false;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      const customerInfo = await restorePurchases();
      const pro =
        customerInfo.entitlements.active[TAREITAS_PRO_ENTITLEMENT] != null;
      setIsPro(pro);
      setCachedIsPro(pro);

      if (pro) {
        setYearlyPrice(null);
      }

      return pro;
    } catch {
      setError(t('subscription.restore_error'));
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isAvailable]);

  return {
    yearlyPrice,
    isPro,
    isLoading,
    isPurchasing,
    isAvailable,
    error,
    subscribe,
    restore,
    refresh,
  };
}

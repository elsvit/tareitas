import { useCallback, useEffect, useState } from 'react';

import { isRevenueCatNativeModuleAvailable } from '~/services/subscriptions/revenueCatInit';
import { getIsPro } from '~/services/subscriptions/revenueCatSubscription';

let cachedIsPro: boolean | null = null;
const listeners = new Set<(isPro: boolean) => void>();

export function setCachedIsPro(isPro: boolean) {
  cachedIsPro = isPro;
  listeners.forEach(listener => listener(isPro));
}

export function useIsPro() {
  const [isPro, setIsPro] = useState(cachedIsPro ?? false);
  const [isChecking, setIsChecking] = useState(cachedIsPro == null);

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
    const listener = (value: boolean) => setIsPro(value);

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

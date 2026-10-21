import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';

/**
 * Defers expensive derived data until after the tab has focused and painted.
 * While switching away, keeps the last value so returning to the tab feels instant.
 */
export function useDeferredFocusValue<T>(
  factory: () => T,
  enabled: boolean,
  deps: readonly unknown[],
  emptyValue: T,
): T {
  const isFocused = useIsFocused();
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  const cacheRef = useRef<T>(emptyValue);
  const [value, setValue] = useState<T>(() => cacheRef.current);

  useEffect(() => {
    if (!enabled || !isFocused) {
      return;
    }

    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }

      const next = factoryRef.current();
      cacheRef.current = next;
      setValue(next);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [enabled, isFocused, ...deps]);

  if (!enabled) {
    return emptyValue;
  }

  if (!isFocused) {
    return cacheRef.current;
  }

  return value;
}

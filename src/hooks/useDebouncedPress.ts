import { useCallback, useEffect, useRef } from 'react';

import { PRESS_DEBOUNCE_MS } from '~/constants/time';

export function useDebouncedPress(
  onPress: () => void,
  debounceMs: number = PRESS_DEBOUNCE_MS,
) {
  const isLockedRef = useRef(false);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (unlockTimeoutRef.current !== null) {
        clearTimeout(unlockTimeoutRef.current);
      }
    },
    [],
  );

  return useCallback(() => {
    if (isLockedRef.current) {
      return;
    }

    isLockedRef.current = true;
    onPress();

    if (unlockTimeoutRef.current !== null) {
      clearTimeout(unlockTimeoutRef.current);
    }

    unlockTimeoutRef.current = setTimeout(() => {
      isLockedRef.current = false;
      unlockTimeoutRef.current = null;
    }, debounceMs);
  }, [debounceMs, onPress]);
}

import { useCallback, useEffect, useRef } from 'react';

import { PRESS_DEBOUNCE_MS } from '~/constants/time';

let sharedPressLocked = false;
let sharedUnlockTimeout: ReturnType<typeof setTimeout> | null = null;

function releaseSharedPressLock(debounceMs: number) {
  if (sharedUnlockTimeout !== null) {
    clearTimeout(sharedUnlockTimeout);
  }

  sharedUnlockTimeout = setTimeout(() => {
    sharedPressLocked = false;
    sharedUnlockTimeout = null;
  }, debounceMs);
}

export function useDebouncedPress<Args extends unknown[]>(
  onPress: (...args: Args) => void,
  debounceMs: number = PRESS_DEBOUNCE_MS,
) {
  const onPressRef = useRef(onPress);

  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  useEffect(
    () => () => {
      if (sharedUnlockTimeout !== null) {
        clearTimeout(sharedUnlockTimeout);
        sharedUnlockTimeout = null;
        sharedPressLocked = false;
      }
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      if (sharedPressLocked) {
        return;
      }

      sharedPressLocked = true;
      onPressRef.current(...args);
      releaseSharedPressLock(debounceMs);
    },
    [debounceMs],
  );
}

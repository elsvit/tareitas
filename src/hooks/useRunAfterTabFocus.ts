import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Defers heavy tab content on the first focus so the shell can paint first.
 * After the tab has loaded once, refocus keeps content visible immediately;
 * multidevice sync and other focus hooks can run in the background.
 */
export function useRunAfterTabFocus(): boolean {
  const [ready, setReady] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnceRef.current) {
        setReady(true);
        return;
      }

      setReady(false);

      let cancelled = false;
      let interactionTask: { cancel: () => void } | null = null;

      const frame = requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }

        interactionTask = InteractionManager.runAfterInteractions(() => {
          if (!cancelled) {
            hasLoadedOnceRef.current = true;
            setReady(true);
          }
        });
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        interactionTask?.cancel();
      };
    }, []),
  );

  return ready;
}

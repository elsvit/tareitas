import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

import { TabScreenLoadingShell } from './TabScreenLoadingShell';

type LoadFn = () => Promise<{ default: React.ComponentType<object> }>;

type Props = {
  testID?: string;
  loadScreen: LoadFn;
};

/**
 * Keeps the tab route module tiny so the navigator can switch tabs immediately.
 * Shows a lightweight shell first, then loads the real screen chunk asynchronously.
 */
export function DeferredMainTabScreen({ testID, loadScreen }: Props) {
  const loadScreenRef = useRef(loadScreen);
  loadScreenRef.current = loadScreen;

  const heavyRef = useRef<React.ComponentType<object> | null>(null);
  const [Heavy, setHeavy] = useState<React.ComponentType<object> | null>(
    () => heavyRef.current,
  );
  const [showHeavy, setShowHeavy] = useState(() => heavyRef.current != null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let interactionTask: { cancel: () => void } | undefined;

      const revealHeavy = () => {
        if (!cancelled) {
          setShowHeavy(true);
        }
      };

      if (heavyRef.current) {
        setShowHeavy(true);
        return () => {
          cancelled = true;
          interactionTask?.cancel();
        };
      }

      setShowHeavy(false);

      const frameId = requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }

        void loadScreenRef.current().then(module => {
          if (cancelled) {
            return;
          }

          heavyRef.current = module.default;
          setHeavy(() => module.default);
          interactionTask = InteractionManager.runAfterInteractions(revealHeavy);
        });
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(frameId);
        interactionTask?.cancel();
      };
    }, []),
  );

  if (showHeavy && Heavy) {
    return <Heavy />;
  }

  return <TabScreenLoadingShell testID={testID} />;
}

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TextInput } from 'react-native-paper';

export function useFocusSubtaskInputAfterAdd(subtaskCount: number) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const inputRefs = useRef<Map<number, TextInput>>(new Map());

  const focusSubtaskInputAtIndex = useCallback((index: number) => {
    setFocusIndex(index);
  }, []);

  const registerSubtaskInputRef = useCallback(
    (index: number) => (ref: TextInput | null) => {
      if (ref) {
        inputRefs.current.set(index, ref);
        return;
      }

      inputRefs.current.delete(index);
    },
    [],
  );

  useEffect(() => {
    if (focusIndex === null || subtaskCount <= focusIndex) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      inputRefs.current.get(focusIndex)?.focus();
      setFocusIndex(null);
    });

    return () => cancelAnimationFrame(frameId);
  }, [focusIndex, subtaskCount]);

  return { focusSubtaskInputAtIndex, registerSubtaskInputRef };
}

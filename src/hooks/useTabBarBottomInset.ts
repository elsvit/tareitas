import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useTabBarBottomInset = (minPadding = 12): number => {
  const insets = useSafeAreaInsets();

  return useMemo(
    () => Math.max(insets.bottom, minPadding),
    [insets.bottom, minPadding],
  );
};

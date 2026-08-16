import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IS_ANDROID } from '~/constants/settings';

const ANDROID_FALLBACK_NAV_BAR_HEIGHT = 48;

const getAndroidNavigationBarHeight = (): number => {
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  const heightDiff = screen.height - window.height;

  return heightDiff > 0 ? heightDiff : 0;
};

export const useTabBarBottomInset = (minPadding = 12): number => {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    if (!IS_ANDROID) {
      return Math.max(insets.bottom, minPadding);
    }

    const navigationBarHeight = getAndroidNavigationBarHeight();
    const resolvedInset = Math.max(
      insets.bottom,
      navigationBarHeight,
      minPadding,
    );

    // Edge-to-edge on Android 11 tablets can report 0 bottom inset while the
    // 3-button navigation bar still overlaps app UI.
    if (insets.bottom === 0 && navigationBarHeight === 0) {
      return Math.max(ANDROID_FALLBACK_NAV_BAR_HEIGHT, minPadding);
    }

    return resolvedInset;
  }, [insets.bottom, minPadding]);
};

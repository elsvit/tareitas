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

    if (insets.bottom > 0) {
      return Math.max(insets.bottom, minPadding);
    }

    const navigationBarHeight = getAndroidNavigationBarHeight();

    if (navigationBarHeight > 0) {
      return Math.max(navigationBarHeight, minPadding);
    }

    return Math.max(ANDROID_FALLBACK_NAV_BAR_HEIGHT, minPadding);
  }, [insets.bottom, minPadding]);
};

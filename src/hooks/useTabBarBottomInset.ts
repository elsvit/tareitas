import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IS_ANDROID } from '~/constants/settings';

/** Extra lift for tab labels when Android draws over the nav button area. */
export const TAB_BAR_ANDROID_NAV_EXTRA_PADDING = 4;
export const TAB_BAR_PADDING_TOP = 16;
export const TAB_BAR_MIN_PADDING_BOTTOM = 12;
export const TAB_BAR_CONTENT_HEIGHT = 60;

export const useTabBarBottomInset = (minPadding = 12): number => {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const base = Math.max(insets.bottom, minPadding);
    const hasAndroidNavButtons = IS_ANDROID && insets.bottom > 0;

    return base + (hasAndroidNavButtons ? TAB_BAR_ANDROID_NAV_EXTRA_PADDING : 0);
  }, [insets.bottom, minPadding]);
};

export const useTabBarHeight = (): number => {
  const tabBarPaddingBottom = useTabBarBottomInset(TAB_BAR_MIN_PADDING_BOTTOM);

  return TAB_BAR_PADDING_TOP + TAB_BAR_CONTENT_HEIGHT + tabBarPaddingBottom;
};

/** Bottom offset for FABs on tab screens (Android tab bar overlays content). */
export const useTabScreenFabBottom = (gap = 8): number => {
  const tabBarHeight = useTabBarHeight();

  return IS_ANDROID ? tabBarHeight + gap : gap;
};

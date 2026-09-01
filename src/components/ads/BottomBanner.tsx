import React from 'react';

import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { GoogleMobileBannerAdFromConfig } from '~/components/ads/GoogleMobileBannerAd.native';
import { AD_TASK_AMOUNT_START } from '~/constants/admob';
import { isGoogleMobileAdsNativeModuleAvailable } from '~/services/ads/googleMobileAds.native';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';

export const BOTTOM_BANNER_HEIGHT = 50;

export function useBottomBannerVisible() {
  const taskCount = useSelector(selectAllTaskAssignment).length;

  if (!isGoogleMobileAdsNativeModuleAvailable()) {
    return false;
  }

  return taskCount > AD_TASK_AMOUNT_START;
}

export function useBottomBannerScrollPadding(extraPadding = 16) {
  const isVisible = useBottomBannerVisible();

  if (!isVisible) {
    return 0;
  }

  return BOTTOM_BANNER_HEIGHT + extraPadding;
}

export function BottomBanner() {
  const isVisible = useBottomBannerVisible();

  if (!isVisible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { minHeight: BOTTOM_BANNER_HEIGHT }]}
    >
      <GoogleMobileBannerAdFromConfig />
    </View>
  );
}

/** @deprecated Use BottomBanner instead */
export const ParentBottomBanner = BottomBanner;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
});

export default BottomBanner;

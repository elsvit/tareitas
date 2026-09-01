import React, { useEffect } from 'react';

import { StyleSheet, View } from 'react-native';

import {
    getBannerAdUnitId,
    getGoogleMobileAdsModule,
    initializeGoogleMobileAds,
    isGoogleMobileAdsNativeModuleAvailable,
} from '~/services/ads/googleMobileAds.native';

export function GoogleMobileBannerAd({ unitId }: { unitId: string }) {
  useEffect(() => {
    void initializeGoogleMobileAds();
  }, []);

  if (!isGoogleMobileAdsNativeModuleAvailable()) {
    return null;
  }

  const adsModule = getGoogleMobileAdsModule();

  if (!adsModule) {
    return null;
  }

  const { BannerAd, BannerAdSize } = adsModule;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

export function GoogleMobileBannerAdFromConfig() {
  const unitId = getBannerAdUnitId();

  if (!unitId) {
    return null;
  }

  return <GoogleMobileBannerAd unitId={unitId} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
});

export default GoogleMobileBannerAdFromConfig;

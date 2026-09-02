import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { GoogleMobileBannerAdFromConfig } from '~/components/ads/GoogleMobileBannerAd.native';
import { SubscriptionModal } from '~/components/subscriptions/SubscriptionModal';
import { IconButton } from '~/components/ui/IconButton';
import { AD_TASK_AMOUNT_START } from '~/constants/admob';
import { useIsPro } from '~/hooks/useIsPro';
import { useSubscription } from '~/hooks/useSubscription';
import { isGoogleMobileAdsNativeModuleAvailable } from '~/services/ads/googleMobileAds.native';
import { t } from '~/services';
import { Colors } from '~/styles';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';

export const BOTTOM_BANNER_HEIGHT = 50;

export function useBottomBannerVisible() {
  const { isPro } = useIsPro();
  const taskCount = useSelector(selectAllTaskAssignment).length;

  if (!isGoogleMobileAdsNativeModuleAvailable()) {
    return false;
  }

  if (isPro) {
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isVisible = useBottomBannerVisible();
  const subscription = useSubscription();

  const handleSubscribe = async () => {
    const success = await subscription.subscribe();

    if (success) {
      setIsModalVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.container, { minHeight: BOTTOM_BANNER_HEIGHT }]}
      >
        <IconButton
          style={styles.closeButton}
          Icon={<CloseIcon width={18} height={18} fill={Colors.grey500} />}
          onPress={() => setIsModalVisible(true)}
          size={32}
          accessibilityLabel={t('subscription.remove_ads')}
        />
        <GoogleMobileBannerAdFromConfig />
      </View>

      <SubscriptionModal
        isVisible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        yearlyPrice={subscription.yearlyPrice}
        isLoading={subscription.isLoading}
        isPurchasing={subscription.isPurchasing}
        isPro={subscription.isPro}
        isAvailable={subscription.isAvailable}
        error={subscription.error}
        onSubscribe={handleSubscribe}
        onRestore={subscription.restore}
      />
    </>
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
  closeButton: {
    position: 'absolute',
    top: -36,
    left: 8,
    zIndex: 11,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
});

export default BottomBanner;

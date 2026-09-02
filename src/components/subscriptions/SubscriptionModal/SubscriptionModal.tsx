import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { SubscriptionOffer } from '~/components/subscriptions/SubscriptionOffer';
import { IconButton } from '~/components/ui/IconButton';
import { Text } from '~/components/ui/Text';
import { t } from '~/services';
import { Colors } from '~/styles';

import { styles } from './styles';

export type SubscriptionModalProps = {
  isVisible: boolean;
  onRequestClose: () => void;
  yearlyPrice: string | null;
  isLoading: boolean;
  isPurchasing: boolean;
  isPro: boolean;
  isAvailable: boolean;
  error: string | null;
  onSubscribe: () => void;
  onRestore: () => void;
  dismissOnBackdrop?: boolean;
};

export function SubscriptionModal({
  isVisible,
  onRequestClose,
  yearlyPrice,
  isLoading,
  isPurchasing,
  isPro,
  isAvailable,
  error,
  onSubscribe,
  onRestore,
  dismissOnBackdrop = true,
}: SubscriptionModalProps) {
  const handleSubscribe = () => {
    onSubscribe();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleMedium" weight="bold">
              {t('subscription.modal_title')}
            </Text>
            <IconButton
              Icon={<CloseIcon width={24} height={24} fill={Colors.grey500} />}
              onPress={onRequestClose}
              size={24}
              accessibilityLabel={t('button.cancel')}
            />
          </View>

          <SubscriptionOffer
            description={t('subscription.modal_description')}
            yearlyPrice={yearlyPrice}
            isLoading={isLoading}
            isPurchasing={isPurchasing}
            isPro={isPro}
            isAvailable={isAvailable}
            error={error}
            onSubscribe={handleSubscribe}
            onRestore={onRestore}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default SubscriptionModal;

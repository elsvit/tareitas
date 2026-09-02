import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button, ButtonColors, Text } from '~/components/ui';
import { SCREEN_TEXT } from '~/constants/formField';
import { t } from '~/services';
import { useStyle } from '~/styles';

import themedStyles from './styles';

export type SubscriptionOfferProps = {
  title?: string | null;
  description?: string;
  yearlyPrice: string | null;
  isLoading: boolean;
  isPurchasing: boolean;
  isPro: boolean;
  isAvailable: boolean;
  error: string | null;
  onSubscribe: () => void;
  onRestore: () => void;
  showRestore?: boolean;
};

export function SubscriptionOffer({
  title = t('subscription.title'),
  description = t('subscription.description'),
  yearlyPrice,
  isLoading,
  isPurchasing,
  isPro,
  isAvailable,
  error,
  onSubscribe,
  onRestore,
  showRestore = true,
}: SubscriptionOfferProps) {
  const [styles] = useStyle(themedStyles);

  if (isPro) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" weight="bold" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.message}>{t('subscription.already_pro')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!!title && (
        <Text variant="titleMedium" weight="bold" style={styles.title}>
          {title}
        </Text>
      )}

      <Text style={styles.message}>{description}</Text>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : yearlyPrice ? (
        <Text variant="titleLarge" weight="bold" style={styles.price}>
          {t('subscription.yearly_price', { price: yearlyPrice })}
        </Text>
      ) : (
        <Text style={styles.message}>
          {isAvailable
            ? t('subscription.loading_price')
            : t('subscription.unavailable')}
        </Text>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button
        mode="contained"
        bgColor={ButtonColors.Green}
        onPress={onSubscribe}
        disabled={!isAvailable || isLoading || isPurchasing || !yearlyPrice}
        loading={isPurchasing}
        style={styles.subscribeButton}
      >
        {t('subscription.subscribe')}
      </Button>

      {showRestore && (
        <Pressable
          onPress={onRestore}
          disabled={!isAvailable || isPurchasing}
          style={styles.restoreButton}
        >
          <Text style={styles.restoreText}>{t('subscription.restore')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default SubscriptionOffer;

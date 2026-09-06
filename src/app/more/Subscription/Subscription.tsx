import React from 'react';
import { ScrollView, View } from 'react-native';

import { Redirect } from 'expo-router';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { SubscriptionOffer } from '~/components/subscriptions/SubscriptionOffer';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useSubscription } from '~/hooks/useSubscription';
import { t } from '~/services';
import { spacing, styleSheetFactory } from '~/styles';
import { Colors } from '~/styles/colors';
import { useStyle } from '~/styles/hooks';

export default function SubscriptionScreen() {
  const [styles] = useStyle(themedStyles);
  const { isParent } = useCurrentUser();
  const subscription = useSubscription();

  if (!isParent) {
    return <Redirect href="/(tabs)/More" />;
  }

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('subscription.subscribe')}
        containerStyle={styles.screenHeader}
        titleStyle={styles.screenTitle}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <SubscriptionOffer
          yearlyPrice={subscription.yearlyPrice}
          isLoading={subscription.isLoading}
          isPurchasing={subscription.isPurchasing}
          isPro={subscription.isPro}
          isAvailable={subscription.isAvailable}
          error={subscription.error}
          onSubscribe={subscription.subscribe}
          onRestore={subscription.restore}
          />
        </View>
      </ScrollView>
    </SafeAreaBgImage>
  );
}

const themedStyles = styleSheetFactory(() => ({
  screenHeader: {
    backgroundColor: 'transparent',
  },
  screenTitle: {
    color: Colors.grey800,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    paddingBottom: spacing(8),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: spacing(4),
  },
}));

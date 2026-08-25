import React from 'react';
import { ScrollView } from 'react-native';

import { useRouter } from 'expo-router';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { OnboardingLoginStep } from '~/components/onboarding/OnboardingLoginStep';
import { t } from '~/services';
import { useStyle } from '~/styles';

import themedStyles from './styles';

export default function AccountLogin() {
  const router = useRouter();
  const [styles] = useStyle(themedStyles);

  const handleSuccess = () => {
    router.replace('/(tabs)/Tasks');
  };

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('settings.account.login_screen_title')}
        containerStyle={styles.screenHeader}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingLoginStep
          onSignUpPress={() => router.replace('/(onboarding)')}
          onSuccess={handleSuccess}
        />
      </ScrollView>
    </SafeAreaBgImage>
  );
}

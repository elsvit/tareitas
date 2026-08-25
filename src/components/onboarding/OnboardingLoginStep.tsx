import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { RadioButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import {
  Button,
  ButtonColors,
  Card,
  Space,
  Text,
  TextInput,
} from '~/components/ui';
import { OTPInput } from '~/components/ui/OTPInput';
import { t } from '~/services';
import { ApiError } from '~/services/api/client';
import {
  clearFamilyStore,
  hydrateFamilyStore,
} from '~/services/familySync';
import { loginAndLoadFamily } from '~/services/multideviceSetup';
import type { AppDispatch } from '~/store';
import { Colors } from '~/styles';

import { OnboardingStepHeader } from './OnboardingStepHeader';
import { onboardingStyles as styles } from './styles';

type LoginMode = 'admin' | 'member';

type OnboardingLoginStepProps = {
  onSignUpPress: () => void;
  onSuccess: () => void;
};

export function OnboardingLoginStep({
  onSignUpPress,
  onSuccess,
}: OnboardingLoginStepProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<LoginMode>('admin');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModeChange = (nextMode: LoginMode) => {
    setMode(nextMode);
    setIdentifier('');
    setError(null);
  };

  const handleLogin = async () => {
    setError(null);

    if (!identifier.trim()) {
      setError(
        mode === 'admin'
          ? t('onboarding.login.error_email_required')
          : t('onboarding.login.error_username_required'),
      );
      return;
    }

    if (pin.length !== 4) {
      setError(t('onboarding.login.error_pin_required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAndLoadFamily(
        mode === 'admin'
          ? {
              email: identifier.trim(),
              pin,
            }
          : {
              username: identifier.trim(),
              pin,
            },
      );

      try {
        hydrateFamilyStore(
          dispatch,
          result.family,
          result.user,
          {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        );
      } catch (hydrateError) {
        clearFamilyStore(dispatch);
        throw hydrateError;
      }

      onSuccess();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : t('onboarding.login.error_generic'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View>
      <OnboardingStepHeader
        title={t('onboarding.login.title')}
        description={t('onboarding.login.subtitle')}
        accentColor={Colors.blue600}
      />

      <RadioButton.Group
        onValueChange={value => handleModeChange(value as LoginMode)}
        value={mode}
      >
        <View style={styles.loginModeOptions}>
          <RadioButton.Item
            label={t('onboarding.login.admin')}
            value="admin"
            style={styles.loginModeOption}
            labelStyle={styles.loginModeOptionLabel}
          />
          <RadioButton.Item
            label={t('onboarding.login.not_admin')}
            value="member"
            style={styles.loginModeOption}
            labelStyle={styles.loginModeOptionLabel}
          />
        </View>
      </RadioButton.Group>

      <Space size={1} />

      <Card style={styles.loginFormCard}>
        <TextInput
          label={
            mode === 'admin'
              ? t('onboarding.login.email')
              : t('onboarding.login.username')
          }
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType={
            mode === 'admin' ? 'email-address' : 'default'
          }
        />
        <Space size={2} />
        <Text variant="bodyMedium">
          {t('onboarding.login.pin')}
        </Text>
        <Space size={1} />
        <OTPInput
          maxLength={4}
          value={pin}
          onChange={setPin}
          onComplete={handleLogin}
        />
        {error ? (
          <>
            <Space size={2} />
            <Text variant="bodyMedium" color={Colors.red500}>
              {error}
            </Text>
          </>
        ) : null}
        <Space size={2} />
        <Button
          mode="contained"
          bgColor={ButtonColors.Green}
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleLogin}
        >
          {t('onboarding.login.submit')}
        </Button>
        <Space size={2} />
        <Pressable
          onPress={onSignUpPress}
          style={styles.signUpLink}
        >
          <Text
            variant="bodyMedium"
            color={Colors.blue600}
            weight="bold"
          >
            {t('onboarding.login.sign_up')}
          </Text>
        </Pressable>
      </Card>
    </View>
  );
}

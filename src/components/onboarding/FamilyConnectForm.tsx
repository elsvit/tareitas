import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { RadioButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { ForgotPasswordModal } from '~/components/modals';
import {
  Button,
  ButtonColors,
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
import { ESyncMode } from '~/store/settings/enums';
import {
  setRequireLogin,
  setSyncMode,
} from '~/store/settings/slice';
import { Colors } from '~/styles';

import { onboardingStyles as styles } from './styles';

type ConnectLoginMode = 'admin' | 'member';

type FamilyConnectFormProps = {
  onSuccess: () => void;
  showSignUpLink?: boolean;
  onSignUpPress?: () => void;
};

export function FamilyConnectForm({
  onSuccess,
  showSignUpLink = false,
  onSignUpPress,
}: FamilyConnectFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [loginMode, setLoginMode] =
    useState<ConnectLoginMode>('admin');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] =
    useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<
    string | null
  >(null);

  const handleLoginModeChange = (
    nextMode: ConnectLoginMode,
  ) => {
    setLoginMode(nextMode);
    setIdentifier('');
    setLoginError(null);
    setResetSuccessMessage(null);
  };

  const handleLogin = async () => {
    setLoginError(null);

    if (!identifier.trim()) {
      setLoginError(
        loginMode === 'admin'
          ? t('onboarding.login.error_email_required')
          : t('onboarding.login.error_username_required'),
      );
      return;
    }

    if (pin.length !== 4) {
      setLoginError(t('onboarding.login.error_pin_required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAndLoadFamily(
        loginMode === 'admin'
          ? {
              email: identifier.trim(),
              pin,
            }
          : {
              username: identifier.trim(),
              pin,
            },
      );

      dispatch(setSyncMode(ESyncMode.multidevice));
      dispatch(setRequireLogin(false));

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
      setLoginError(
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
      <RadioButton.Group
        onValueChange={value =>
          handleLoginModeChange(value as ConnectLoginMode)
        }
        value={loginMode}
      >
        <View style={styles.loginModeOptions}>
          {(
            [
              { value: 'admin', label: t('onboarding.login.admin') },
              { value: 'member', label: t('onboarding.login.not_admin') },
            ] as const
          ).map(option => {
            const selected = loginMode === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleLoginModeChange(option.value)}
                style={[
                  styles.loginModeOption,
                  selected && styles.loginModeOptionSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <RadioButton value={option.value} color={Colors.blue600} />
                <Text
                  variant="bodyMedium"
                  weight="bold"
                  color={selected ? Colors.blue600 : Colors.grey700}
                  style={styles.loginModeOptionLabel}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </RadioButton.Group>

      <TextInput
        label={
          loginMode === 'admin'
                  ? t('onboarding.login.email')
                  : t('users.unique_username')
        }
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType={
          loginMode === 'admin' ? 'email-address' : 'default'
        }
      />
      <Space size={2} />
      <Text variant="bodyMedium">{t('onboarding.login.pin')}</Text>
      <Space size={1} />
      <OTPInput
        maxLength={4}
        value={pin}
        onChange={setPin}
        onComplete={handleLogin}
      />
      {loginError ? (
        <>
          <Space size={2} />
          <Text variant="bodyMedium" color={Colors.red500}>
            {loginError}
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
      {loginMode === 'admin' ? (
        <>
          <Space size={2} />
          <Pressable
            onPress={() => {
              setForgotPasswordVisible(true);
              setResetSuccessMessage(null);
            }}
            style={styles.signUpLink}
          >
            <Text
              variant="bodyMedium"
              color={Colors.blue600}
              weight="bold"
            >
              {t('onboarding.login.forgot_pin')}
            </Text>
          </Pressable>
        </>
      ) : null}
      {resetSuccessMessage ? (
        <>
          <Space size={2} />
          <Text variant="bodyMedium" color={Colors.green600}>
            {resetSuccessMessage}
          </Text>
        </>
      ) : null}
      {showSignUpLink && onSignUpPress ? (
        <>
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
        </>
      ) : null}
      <ForgotPasswordModal
        isVisible={forgotPasswordVisible}
        onRequestClose={() => setForgotPasswordVisible(false)}
        initialEmail={identifier}
        onSuccess={() =>
          setResetSuccessMessage(t('onboarding.login.forgot_success'))
        }
      />
    </View>
  );
}

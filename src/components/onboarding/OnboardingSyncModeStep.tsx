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
import { clearFamilyStore, hydrateFamilyStore } from '~/services/familySync';
import { loginAndLoadFamily } from '~/services/multideviceSetup';
import type { AppDispatch } from '~/store';
import { ESyncMode } from '~/store/settings/enums';
import { setSyncMode } from '~/store/settings/slice';
import { Colors } from '~/styles';

import { OnboardingStepHeader } from './OnboardingStepHeader';
import { onboardingStyles as styles } from './styles';

export type OnboardingSetupPath = 'create' | 'connect';

type ConnectLoginMode = 'admin' | 'member';

type OnboardingSyncModeStepProps = {
  setupPath: OnboardingSetupPath;
  onSetupPathChange: (path: OnboardingSetupPath) => void;
  value: ESyncMode;
  onChange: (mode: ESyncMode) => void;
  onMemberLoginSuccess: () => void;
};

type SyncModeOption = {
  mode: ESyncMode;
  title: string;
  description: string;
  accentColor: string;
};

export function OnboardingSyncModeStep({
  setupPath,
  onSetupPathChange,
  value,
  onChange,
  onMemberLoginSuccess,
}: OnboardingSyncModeStepProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [loginMode, setLoginMode] =
    useState<ConnectLoginMode>('admin');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginModeChange = (
    nextMode: ConnectLoginMode,
  ) => {
    setLoginMode(nextMode);
    setIdentifier('');
    setLoginError(null);
  };

  const syncModeOptions: SyncModeOption[] = [
    {
      mode: ESyncMode.multidevice,
      title: t('onboarding.sync_mode.multidevice.title'),
      description: t('onboarding.sync_mode.multidevice.description'),
      accentColor: Colors.blue600,
    },
    {
      mode: ESyncMode.deviceOnly,
      title: t('onboarding.sync_mode.device_only.title'),
      description: t('onboarding.sync_mode.device_only.description'),
      accentColor: Colors.orange500,
    },
  ];

  const handleMemberLogin = async () => {
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

      onMemberLoginSuccess();
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
      <OnboardingStepHeader
        title={t('onboarding.sync_mode.title')}
        description={t('onboarding.sync_mode.subtitle')}
        accentColor={Colors.blue600}
      />

      <View style={styles.syncModeSection}>
        <Pressable
          onPress={() => onSetupPathChange('create')}
          style={[
            styles.syncModeSectionHeader,
            setupPath === 'create' && styles.syncModeSectionHeaderSelected,
          ]}
        >
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'create' ? Colors.blue600 : Colors.grey700
            }
          >
            {t('onboarding.sync_mode.create_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'create' ? (
          <View style={styles.syncModeOptions}>
            {syncModeOptions.map(option => {
              const selected = value === option.mode;

              return (
                <Pressable
                  key={option.mode}
                  onPress={() => onChange(option.mode)}
                  style={[
                    styles.syncModeOption,
                    selected && {
                      borderColor: option.accentColor,
                      backgroundColor: 'rgba(255, 255, 255, 0.72)',
                    },
                  ]}
                >
                  <Text
                    variant="titleMedium"
                    fontFamily="fredoka"
                    weight="bold"
                    color={
                      selected ? option.accentColor : Colors.grey700
                    }
                  >
                    {option.title}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={styles.syncModeOptionDescription}
                  >
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <Space size={3} />

      <View style={styles.syncModeSection}>
        <Pressable
          onPress={() => onSetupPathChange('connect')}
          style={[
            styles.syncModeSectionHeader,
            setupPath === 'connect' && styles.syncModeSectionHeaderSelected,
          ]}
        >
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'connect' ? Colors.blue600 : Colors.grey700
            }
          >
            {t('onboarding.sync_mode.connect_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'connect' ? (
          <Card style={styles.loginFormCard}>
            <RadioButton.Group
              onValueChange={value =>
                handleLoginModeChange(value as ConnectLoginMode)
              }
              value={loginMode}
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

            <TextInput
              label={
                loginMode === 'admin'
                  ? t('onboarding.login.email')
                  : t('onboarding.login.username')
              }
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType={
                loginMode === 'admin'
                  ? 'email-address'
                  : 'default'
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
              onComplete={handleMemberLogin}
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
              onPress={handleMemberLogin}
            >
              {t('onboarding.login.submit')}
            </Button>
          </Card>
        ) : null}
      </View>
    </View>
  );
}

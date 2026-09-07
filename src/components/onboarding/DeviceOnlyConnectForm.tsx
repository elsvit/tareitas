import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  ButtonColors,
  Space,
  Text,
  TextInput,
} from '~/components/ui';
import { OTPInput } from '~/components/ui/OTPInput';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { ERole, ESyncMode } from '~/store/settings/enums';
import {
  setCurrentRole,
  setCurrentUser,
  setRequireLogin,
  setSyncMode,
  setTaskCalendarDate,
} from '~/store/settings/slice';
import type { AppDispatch } from '~/store/store';
import { Colors } from '~/styles';
import { getTodayDateString } from '~/utils/date';
import { verifyPassword } from '~/utils/users/passwordPattern';

import { onboardingStyles as styles } from './styles';

type ConnectLoginMode = 'admin' | 'member';

type DeviceOnlyConnectFormProps = {
  onSuccess: () => void;
};

export function DeviceOnlyConnectForm({
  onSuccess,
}: DeviceOnlyConnectFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const parents = useSelector(selectAllParents);
  const children = useSelector(selectAllChildren);

  const [loginMode, setLoginMode] =
    useState<ConnectLoginMode>('admin');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const admins = useMemo(
    () => parents.filter(parent => parent.role === ERole.admin),
    [parents],
  );

  const hasLocalFamily = parents.length > 0;
  const adminRequiresIdentifier = admins.some(admin =>
    Boolean(admin.email?.trim()),
  );

  const handleLoginModeChange = (nextMode: ConnectLoginMode) => {
    setLoginMode(nextMode);
    setIdentifier('');
    setLoginError(null);
  };

  const completeLogin = (userId: string, role: ERole) => {
    dispatch(setSyncMode(ESyncMode.deviceOnly));
    dispatch(setRequireLogin(false));
    dispatch(setCurrentUser(userId));
    dispatch(setCurrentRole(role));
    dispatch(setTaskCalendarDate(getTodayDateString()));
    setIdentifier('');
    setPin('');
    setLoginError(null);
    onSuccess();
  };

  const handleLogin = async () => {
    setLoginError(null);

    const trimmedIdentifier = identifier.trim();

    if (loginMode === 'admin') {
      if (adminRequiresIdentifier && !trimmedIdentifier) {
        setLoginError(t('onboarding.login.error_email_required'));
        return;
      }

      if (pin.length !== 4) {
        setLoginError(t('onboarding.login.error_pin_required'));
        return;
      }

      setIsSubmitting(true);

      try {
        const matchedAdmin = admins.find(admin => {
          const adminEmail = admin.email?.trim().toLowerCase();

          if (adminEmail) {
            return adminEmail === trimmedIdentifier.toLowerCase();
          }

          if (trimmedIdentifier) {
            return false;
          }

          return admins.length === 1;
        });

        if (
          !matchedAdmin?.passwordPattern?.trim() ||
          !verifyPassword(matchedAdmin.passwordPattern, pin)
        ) {
          setLoginError(t('onboarding.login.error_generic'));
          return;
        }

        completeLogin(matchedAdmin.id, ERole.admin);
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!trimmedIdentifier) {
      setLoginError(t('onboarding.login.error_username_required'));
      return;
    }

    if (pin.length !== 4) {
      setLoginError(t('onboarding.login.error_pin_required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedUsername = trimmedIdentifier.toLowerCase();
      const matchedParent = parents.find(
        parent =>
          parent.username?.trim().toLowerCase() === normalizedUsername,
      );
      const matchedChild = children.find(
        child =>
          child.username?.trim().toLowerCase() === normalizedUsername,
      );
      const matchedMember = matchedParent ?? matchedChild;

      if (
        !matchedMember?.passwordPattern?.trim() ||
        !verifyPassword(matchedMember.passwordPattern, pin)
      ) {
        setLoginError(t('onboarding.login.error_generic'));
        return;
      }

      completeLogin(
        matchedMember.id,
        matchedParent ? matchedParent.role : ERole.child,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasLocalFamily) {
    return (
      <Text variant="bodyMedium" style={styles.deviceOnlyConnectEmpty}>
        {t('onboarding.sync_mode.device_only_connect_empty')}
      </Text>
    );
  }

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
                <RadioButton value={option.value} color={Colors.orange500} />
                <Text
                  variant="bodyMedium"
                  weight="bold"
                  color={selected ? Colors.orange500 : Colors.grey700}
                  style={styles.loginModeOptionLabel}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </RadioButton.Group>

      {loginMode === 'admin' && adminRequiresIdentifier ? (
        <TextInput
          label={t('onboarding.login.email')}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      ) : null}

      {loginMode === 'member' ? (
        <TextInput
          label={t('users.unique_username')}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
      ) : null}

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
    </View>
  );
}

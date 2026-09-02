import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CloseIcon from '~/assets/svg/common/cross.svg';
import { Button, ButtonColors } from '~/components/ui/Button';
import { Space } from '~/components/ui/Space';
import { Text } from '~/components/ui/Text';
import { TextInput } from '~/components/ui/TextInput';
import { IconButton } from '~/components/ui/IconButton';
import { OTPInput } from '~/components/ui/OTPInput';
import { t } from '~/services';
import {
  forgotPassword,
  resetPassword,
} from '~/services/api/authApi';
import { ApiError } from '~/services/api/client';
import { Colors } from '~/styles';

import { styles } from './styles';

type ForgotPasswordStep = 'email' | 'reset';

type Props = {
  isVisible?: boolean;
  onRequestClose: () => void;
  initialEmail?: string;
  onSuccess?: () => void;
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const ForgotPasswordModal: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  initialEmail = '',
  onSuccess,
}) => {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );
  const [infoMessage, setInfoMessage] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setStep('email');
      setEmail(initialEmail);
      setCode('');
      setNewPin('');
      setErrorMessage(null);
      setInfoMessage(null);
      setIsSubmitting(false);
    }
  }, [initialEmail, isVisible]);

  const handleClose = () => {
    onRequestClose();
  };

  const handleSendCode = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!isValidEmail(email)) {
      setErrorMessage(
        t('onboarding.login.forgot_error_email_invalid'),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({
        email: email.trim().toLowerCase(),
      });

      setInfoMessage(
        t('onboarding.login.forgot_code_sent', {
          email: email.trim().toLowerCase(),
        }),
      );
      setStep('reset');
    } catch (caught) {
      setErrorMessage(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : t('onboarding.login.forgot_error_generic'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPin = async () => {
    setErrorMessage(null);

    if (code.length !== 6) {
      setErrorMessage(
        t('onboarding.login.forgot_error_code_required'),
      );
      return;
    }

    if (newPin.length !== 4) {
      setErrorMessage(
        t('onboarding.login.forgot_error_pin_required'),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code,
        newPin,
      });

      onSuccess?.();
      handleClose();
    } catch (caught) {
      setErrorMessage(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : t('onboarding.login.forgot_error_generic'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleMedium" weight="bold">
              {t('onboarding.login.forgot_title')}
            </Text>

            <IconButton
              Icon={
                <CloseIcon
                  width={24}
                  height={24}
                  fill={Colors.grey500}
                />
              }
              onPress={handleClose}
            />
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.message}>
                {t('onboarding.login.forgot_subtitle')}
              </Text>
              <Space size={2} />
              <TextInput
                label={t('onboarding.login.email')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </>
          ) : (
            <>
              {infoMessage ? (
                <Text style={styles.infoText}>{infoMessage}</Text>
              ) : null}
              <Space size={2} />
              <Text variant="bodyMedium">
                {t('onboarding.login.forgot_enter_code')}
              </Text>
              <Space size={1} />
              <OTPInput
                maxLength={6}
                value={code}
                onChange={setCode}
              />
              <Space size={2} />
              <Text variant="bodyMedium">
                {t('onboarding.login.forgot_new_pin')}
              </Text>
              <Space size={1} />
              <OTPInput
                maxLength={4}
                value={newPin}
                onChange={setNewPin}
              />
            </>
          )}

          {errorMessage ? (
            <>
              <Space size={2} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </>
          ) : null}

          <Space size={2} />

          <View style={styles.actions}>
            <Button
              mode="contained"
              bgColor={ButtonColors.Gray}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              {t('button.cancel')}
            </Button>
            <Button
              mode="contained"
              bgColor={ButtonColors.Green}
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                (step === 'email'
                  ? !isValidEmail(email)
                  : code.length !== 6 || newPin.length !== 4)
              }
              onPress={
                step === 'email'
                  ? handleSendCode
                  : handleResetPin
              }
            >
              {step === 'email'
                ? t('onboarding.login.forgot_send_code')
                : t('onboarding.login.forgot_reset')}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ForgotPasswordModal;

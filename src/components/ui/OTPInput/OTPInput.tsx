import React, { useCallback, useEffect, useRef } from 'react';
import { Keyboard, Pressable, View } from 'react-native';

import { OTPInput as OTPInputNative, type OTPInputRef } from 'input-otp-native';

import { Button, ButtonColors } from '~/components/ui/Button';
import { Text } from '~/components/ui/Text';
import { t } from '~/services';

import { styles } from './styles';

function OtpFocusReporter({
  isFocused,
  onFocusChange,
}: {
  isFocused: boolean;
  onFocusChange?: (focused: boolean) => void;
}) {
  const onFocusChangeRef = useRef(onFocusChange);
  onFocusChangeRef.current = onFocusChange;

  useEffect(() => {
    onFocusChangeRef.current?.(isFocused);
  }, [isFocused]);

  return null;
}

interface OTPInputProps {
  maxLength: number;
  value: string;
  onChange: (newValue: string) => void;
  onComplete?: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
  loading?: boolean;
  testID?: string;
  textInputTestID?: string;
  saveButtonTestID?: string;
}

export const OTPInput = ({
  maxLength,
  value,
  onChange,
  onComplete,
  onFocusChange,
  loading = false,
  testID,
  textInputTestID = 'otp-input',
  saveButtonTestID = 'otp-input-save',
}: OTPInputProps) => {
  const otpInputRef = useRef<OTPInputRef>(null);
  const saveButtonRef = useRef<React.ComponentRef<typeof Button>>(null);

  const focusPinInput = useCallback(() => {
    otpInputRef.current?.focus();
  }, []);

  const focusSaveButton = useCallback(() => {
    requestAnimationFrame(() => {
      saveButtonRef.current?.focus?.();
    });
  }, []);

  const handleDigitsComplete = useCallback(() => {
    otpInputRef.current?.blur();
    Keyboard.dismiss();
    focusSaveButton();
  }, [focusSaveButton]);

  const handleReset = () => {
    onChange('');
  };

  const handleSave = () => {
    if (loading || value.length < maxLength) {
      return;
    }

    Keyboard.dismiss();
    onComplete?.(value);
  };

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible={Boolean(testID)}
      collapsable={false}
      importantForAccessibility={testID ? 'yes' : 'auto'}
    >
      <OTPInputNative
        ref={otpInputRef}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onComplete={handleDigitsComplete}
        testID={textInputTestID}
        render={({ slots, isFocused }) => (
          <>
            <OtpFocusReporter
              isFocused={isFocused}
              onFocusChange={onFocusChange}
            />
            <Pressable
              style={styles.slotsRow}
              testID={testID ? `${testID}-slots` : undefined}
              accessible={Boolean(testID)}
              accessibilityRole="button"
              collapsable={false}
              importantForAccessibility={testID ? 'yes' : 'auto'}
              onPress={focusPinInput}
            >
            {slots.map((slot, index) => (
              <View
                key={index}
                testID={testID ? `${testID}-slot-${index}` : undefined}
                accessible={Boolean(testID)}
                collapsable={false}
                importantForAccessibility={testID ? 'yes' : 'auto'}
                style={[
                  styles.slot,
                  {
                    borderColor: slot.isActive ? '#3B82F6' : '#D1D5DB',
                  },
                ]}
              >
                <Text style={styles.slotText}>{slot.char ?? ''}</Text>
              </View>
            ))}
            </Pressable>
          </>
        )}
      />
      <View style={styles.footer}>
        <Button
          mode="contained"
          bgColor={ButtonColors.Gray}
          onPress={handleReset}
          disabled={loading}
        >
          {t('button.reset') || 'Reset'}
        </Button>
        <Button
          ref={saveButtonRef}
          mode="contained"
          onPress={handleSave}
          bgColor={ButtonColors.Green}
          loading={loading}
          disabled={loading || value.length < maxLength}
          testID={saveButtonTestID}
        >
          {t('button.save') || 'Save'}
        </Button>
      </View>
    </View>
  );
};

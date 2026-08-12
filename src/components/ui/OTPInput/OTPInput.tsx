import React, { useCallback, useRef } from 'react';
import { Keyboard, View } from 'react-native';

import { OTPInput as OTPInputNative } from 'input-otp-native';

import { Button, ButtonColors, Text } from '~/components/ui';
import { t } from '~/services';

import { styles } from './styles';

type OTPInputHandle = {
  blur: () => void;
};

interface OTPInputProps {
  maxLength: number;
  value: string;
  onChange: (newValue: string) => void;
  onComplete?: (value: string) => void;
}

export const OTPInput = ({
  maxLength,
  value,
  onChange,
  onComplete,
}: OTPInputProps) => {
  const otpInputRef = useRef<OTPInputHandle>(null);
  const saveButtonRef = useRef<React.ComponentRef<typeof Button>>(null);

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
    if (value.length < maxLength) {
      return;
    }

    Keyboard.dismiss();
    onComplete?.(value);
  };

  return (
    <View style={styles.container}>
      <OTPInputNative
        ref={otpInputRef}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onComplete={handleDigitsComplete}
        render={({ slots }) => (
          <View style={styles.slotsRow}>
            {slots.map((slot, index) => (
              <View
                key={index}
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
          </View>
        )}
      />
      <View style={styles.footer}>
        <Button mode="contained" bgColor={ButtonColors.Gray} onPress={handleReset}>
          {t('button.reset') || 'Reset'}
        </Button>
        <Button
          ref={saveButtonRef}
          mode="contained"
          onPress={handleSave}
          bgColor={ButtonColors.Green}
          disabled={value.length < maxLength}
        >
          {t('button.save') || 'Save'}
        </Button>
      </View>
    </View>
  );
};

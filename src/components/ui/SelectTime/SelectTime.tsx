import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import TimeIcon from '~/assets/svg/common/time.svg';
import { Button, ButtonColors, Text, TextInput } from '~/components/ui';
import { FORM_FIELD, SCREEN_TEXT } from '~/constants/formField';
import { t } from '~/services';

import {
  dateToTimeString,
  formatTimeLabel,
  timeStringToDate,
  type SelectTimeProps,
} from './SelectTime.utils';
import { styles } from './styles';

export function SelectTime({ label, value, onChange }: SelectTimeProps) {
  const [open, setOpen] = useState(false);
  const [draftTime, setDraftTime] = useState(() => timeStringToDate(value));

  const selectedTime = useMemo(() => timeStringToDate(value), [value]);

  useEffect(() => {
    if (open) {
      setDraftTime(selectedTime);
    }
  }, [open, selectedTime]);

  const openPicker = () => {
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
  };

  const handleDraftChange = (_event: DateTimePickerEvent, nextTime?: Date) => {
    if (nextTime) {
      setDraftTime(nextTime);
    }
  };

  const handleConfirm = () => {
    onChange(dateToTimeString(draftTime));
    closePicker();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        style={styles.inputPressable}
      >
        <View style={styles.anchorWrapper} pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={formatTimeLabel(value)}
            editable={false}
            style={styles.input}
            outlineStyle={styles.outlineStyle}
            right={
              <TextInput.Icon
                icon={({ size, color }) => (
                  <TimeIcon width={size} height={size} fill={color} />
                )}
                forceTextInputFocus={false}
                color={FORM_FIELD.label}
              />
            }
          />
        </View>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={closePicker}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={closePicker} />

          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            {!!label && (
              <Text variant="titleMedium" weight="bold" style={styles.sheetTitle}>
                {label}
              </Text>
            )}

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={draftTime}
                mode="time"
                display="spinner"
                onChange={handleDraftChange}
              />
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                bgColor={ButtonColors.Gray}
                textColor={SCREEN_TEXT.primary}
                onPress={closePicker}
                style={styles.actionButton}
              >
                {t('button.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirm}
                style={styles.actionButton}
              >
                {t('button.done')}
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

export default SelectTime;

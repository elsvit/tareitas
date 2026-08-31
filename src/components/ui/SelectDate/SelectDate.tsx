import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarIcon from '~/assets/svg/common/calendar.svg';
import { Button, ButtonColors, Text, TextInput } from '~/components/ui';
import { FORM_FIELD, SCREEN_TEXT } from '~/constants/formField';
import { t } from '~/services';

import {
  dateStringToDate,
  dateToString,
  formatDateLabel,
  type SelectDateProps,
} from './SelectDate.utils';
import { styles } from './styles';

export function SelectDate({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: SelectDateProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => dateStringToDate(value));

  const selectedDate = useMemo(() => dateStringToDate(value), [value]);
  const pickerMinimumDate = useMemo(
    () => (minimumDate ? dateStringToDate(minimumDate) : undefined),
    [minimumDate],
  );
  const pickerMaximumDate = useMemo(
    () => (maximumDate ? dateStringToDate(maximumDate) : undefined),
    [maximumDate],
  );

  useEffect(() => {
    if (open) {
      setDraftDate(selectedDate);
    }
  }, [open, selectedDate]);

  const openPicker = () => {
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
  };

  const handleDraftChange = (_event: DateTimePickerEvent, nextDate?: Date) => {
    if (nextDate) {
      setDraftDate(nextDate);
    }
  };

  const handleConfirm = () => {
    onChange(dateToString(draftDate));
    closePicker();
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    nextDate?: Date,
  ) => {
    if (event.type === 'dismissed' || !nextDate) {
      closePicker();
      return;
    }

    onChange(dateToString(nextDate));
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
            value={formatDateLabel(value)}
            editable={false}
            style={styles.input}
            outlineStyle={styles.outlineStyle}
            right={
              <TextInput.Icon
                icon={({ size, color }) => (
                  <CalendarIcon width={size} height={size} fill={color} />
                )}
                forceTextInputFocus={false}
                color={FORM_FIELD.label}
              />
            }
          />
        </View>
      </Pressable>

      {Platform.OS === 'android' ? (
        open ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            minimumDate={pickerMinimumDate}
            maximumDate={pickerMaximumDate}
            onChange={handleAndroidChange}
          />
        ) : null
      ) : (
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
                value={draftDate}
                mode="date"
                display="spinner"
                minimumDate={pickerMinimumDate}
                maximumDate={pickerMaximumDate}
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
      )}
    </View>
  );
}

export default SelectDate;

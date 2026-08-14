import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

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

export function SelectDate({ label, value, onChange }: SelectDateProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => dateStringToDate(value));

  const selectedDate = useMemo(() => dateStringToDate(value), [value]);

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

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={closePicker}
      >
        <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
          <Pressable style={styles.backdrop} onPress={closePicker} />

          <View style={styles.sheet}>
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
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export default SelectDate;

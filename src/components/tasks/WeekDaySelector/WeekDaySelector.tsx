import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { WeekDay } from '~/types/ECommon';

import { styles } from './styles';

export const ALL_WEEK_DAYS: WeekDay[] = [
  WeekDay.Mon,
  WeekDay.Tue,
  WeekDay.Wed,
  WeekDay.Thu,
  WeekDay.Fri,
  WeekDay.Sat,
  WeekDay.Sun,
];

const WEEK_DAYS = ALL_WEEK_DAYS;

const WEEK_DAY_LABEL_KEYS: Record<WeekDay, string> = {
  [WeekDay.Mon]: 'time.shortWeekDays.mon',
  [WeekDay.Tue]: 'time.shortWeekDays.tue',
  [WeekDay.Wed]: 'time.shortWeekDays.wed',
  [WeekDay.Thu]: 'time.shortWeekDays.thu',
  [WeekDay.Fri]: 'time.shortWeekDays.fri',
  [WeekDay.Sat]: 'time.shortWeekDays.sat',
  [WeekDay.Sun]: 'time.shortWeekDays.sun',
};

type Props = {
  value: WeekDay[];
  onChange: (value: WeekDay[]) => void;
  color?: string;
  readOnly?: boolean;
};

export const WeekDaySelector: React.FC<Props> = ({
  value,
  onChange,
  color = '#2563EB',
  readOnly = false,
}) => {
  const toggleDay = (day: WeekDay) => {
    const isSelected = value.includes(day);

    if (isSelected) {
      onChange(value.filter(item => item !== day));
      return;
    }

    onChange([...value, day].sort((a, b) => a - b));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('time.shortWeekDays.label')}</Text>
      <View style={styles.row}>
        {WEEK_DAYS.map(day => {
          const isSelected = value.includes(day);
          const dayStyle = [
            styles.dayButton,
            isSelected && { backgroundColor: color, borderColor: color },
          ];
          const label = (
            <Text
              style={[
                styles.dayLabel,
                isSelected && styles.dayLabelSelected,
              ]}
            >
              {t(WEEK_DAY_LABEL_KEYS[day] as any)}
            </Text>
          );

          if (readOnly) {
            return (
              <View key={day} style={dayStyle}>
                {label}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={day}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => toggleDay(day)}
              style={dayStyle}
            >
              {label}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

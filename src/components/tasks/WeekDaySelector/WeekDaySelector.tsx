import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { WeekDay } from '~/types/ECommon';

import { styles } from './styles';

const WEEK_DAYS: WeekDay[] = [
  WeekDay.Mon,
  WeekDay.Tue,
  WeekDay.Wed,
  WeekDay.Thu,
  WeekDay.Fri,
  WeekDay.Sat,
  WeekDay.Sun,
];

const WEEK_DAY_LABEL_KEYS: Record<WeekDay, string> = {
  [WeekDay.Mon]: 'tasks.week_days.mon',
  [WeekDay.Tue]: 'tasks.week_days.tue',
  [WeekDay.Wed]: 'tasks.week_days.wed',
  [WeekDay.Thu]: 'tasks.week_days.thu',
  [WeekDay.Fri]: 'tasks.week_days.fri',
  [WeekDay.Sat]: 'tasks.week_days.sat',
  [WeekDay.Sun]: 'tasks.week_days.sun',
};

type Props = {
  value: WeekDay[];
  onChange: (value: WeekDay[]) => void;
  color?: string;
};

export const WeekDaySelector: React.FC<Props> = ({
  value,
  onChange,
  color = '#2563EB',
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
      <Text style={styles.label}>{t('tasks.week_days.label')}</Text>
      <View style={styles.row}>
        {WEEK_DAYS.map(day => {
          const isSelected = value.includes(day);

          return (
            <TouchableOpacity
              key={day}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => toggleDay(day)}
              style={[
                styles.dayButton,
                isSelected && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {t(WEEK_DAY_LABEL_KEYS[day] as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

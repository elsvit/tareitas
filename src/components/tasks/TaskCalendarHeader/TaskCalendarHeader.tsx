import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { format, isToday, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

import ChevronLeftIcon from '~/assets/svg/common/chevron-left.svg';
import ChevronRightIcon from '~/assets/svg/common/chevron-right.svg';
import { Text } from '~/components/ui';
import { DEFAULT_DATE_LOCALE, DEFAULT_LANG } from '~/constants/settings';
import { selectLang } from '~/store/settings/selectors';
import { ELang } from '~/types/ELang';

import { styles } from './styles';

type Props = {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
};

export const TaskCalendarHeader: React.FC<Props> = ({
  date,
  onPrevious,
  onNext,
}) => {
  const lang = useSelector(selectLang) ?? DEFAULT_LANG;

  const formattedDate = useMemo(() => {
    const locale = lang === ELang.en ? enUS : DEFAULT_DATE_LOCALE;

    return format(parseISO(date), 'EEEE, MMM d', { locale });
  }, [date, lang]);

  const isSelectedToday = useMemo(() => isToday(parseISO(date)), [date]);

  return (
    <View style={styles.container}>
      <View style={styles.dateArea}>
        <View style={[styles.dateBadge, isSelectedToday && styles.dateBadgeToday]}>
          <Text variant="titleMedium" style={styles.dateText}>
            {formattedDate}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          onPress={onPrevious}
          style={styles.navButton}
        >
          <ChevronLeftIcon width={24} height={24} fill="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next day"
          onPress={onNext}
          style={styles.navButton}
        >
          <ChevronRightIcon width={24} height={24} fill="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

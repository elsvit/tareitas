import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { format, parseISO } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

import ChevronLeftIcon from '~/assets/svg/common/chevron-left.svg';
import ChevronRightIcon from '~/assets/svg/common/chevron-right.svg';
import { Text } from '~/components/ui';
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
  const lang = useSelector(selectLang);

  const formattedDate = useMemo(() => {
    const locale = lang === ELang.es ? es : enUS;

    return format(parseISO(date), 'EEEE, MMM d', { locale });
  }, [date, lang]);

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.dateText}>
        {formattedDate}
      </Text>

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

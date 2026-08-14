import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { format, isToday, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

import ChevronRightIcon from '~/assets/svg/common/chevron-right.svg';
import FilterIcon from '~/assets/svg/common/filter.svg';
import { Text } from '~/components/ui';
import { DEFAULT_DATE_LOCALE, DEFAULT_LANG } from '~/constants/settings';
import { selectLang } from '~/store/settings/selectors';
import { ELang } from '~/types/ELang';

import { styles } from './styles';

const CHEVRON_SIZE = 24;
const CHEVRON_COLOR = '#374151';
const FILTER_SIZE = 22;
const FILTER_COLOR = '#374151';

type Props = {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  onFilterPress?: () => void;
  activeFilterCount?: number;
  showFilter?: boolean;
};

export const TaskCalendarHeader: React.FC<Props> = ({
  date,
  onPrevious,
  onNext,
  onFilterPress,
  activeFilterCount = 0,
  showFilter = false,
}) => {
  const lang = useSelector(selectLang) ?? DEFAULT_LANG;

  const formattedDate = useMemo(() => {
    const locale = lang === ELang.en ? enUS : DEFAULT_DATE_LOCALE;

    return format(parseISO(date), 'EEEE, MMM d', { locale });
  }, [date, lang]);

  const isSelectedToday = useMemo(() => isToday(parseISO(date)), [date]);

  return (
    <View style={styles.container}>
      <View style={styles.sideSlot}>
        {showFilter && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Filter tasks"
            onPress={onFilterPress}
            style={styles.filterButton}
          >
            <FilterIcon
              width={FILTER_SIZE}
              height={FILTER_SIZE}
              fill={FILTER_COLOR}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerArea}>
        <View style={[styles.dateBadge, isSelectedToday && styles.dateBadgeToday]}>
          <Text variant="titleMedium" style={styles.dateText}>
            {formattedDate}
          </Text>
        </View>
      </View>

      <View style={[styles.sideSlot, styles.sideSlotRight]}>
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            onPress={onPrevious}
            style={styles.navButton}
          >
            <View style={styles.chevronPrevious}>
              <ChevronRightIcon
                width={CHEVRON_SIZE}
                height={CHEVRON_SIZE}
                fill={CHEVRON_COLOR}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Next day"
            onPress={onNext}
            style={styles.navButton}
          >
            <ChevronRightIcon
              width={CHEVRON_SIZE}
              height={CHEVRON_SIZE}
              fill={CHEVRON_COLOR}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

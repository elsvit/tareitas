import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { format, isToday, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

import ChevronRightIcon from '~/assets/svg/common/chevron-right.svg';
import FilterIcon from '~/assets/svg/common/filter.svg';
import SearchCrossIcon from '~/assets/svg/common/search-cross.svg';
import SearchIcon from '~/assets/svg/common/search.svg';
import { Search, Text } from '~/components/ui';
import { DEFAULT_DATE_LOCALE, DEFAULT_LANG } from '~/constants/settings';
import { selectLang } from '~/store/settings/selectors';
import { ELang } from '~/types/ELang';

import { styles } from './styles';

const CHEVRON_SIZE = 24;
const CHEVRON_COLOR = '#374151';
const ICON_SIZE = 24;
const ICON_COLOR = '#374151';

type Props = {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  onFilterPress?: () => void;
  activeFilterCount?: number;
  showFilter?: boolean;
  showSearch?: boolean;
  isSearchVisible?: boolean;
  onSearchPress?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
};

export const TaskCalendarHeader: React.FC<Props> = ({
  date,
  onPrevious,
  onNext,
  onFilterPress,
  activeFilterCount = 0,
  showFilter = false,
  showSearch = false,
  isSearchVisible = false,
  onSearchPress,
  searchQuery = '',
  onSearchQueryChange,
}) => {
  const lang = useSelector(selectLang) ?? DEFAULT_LANG;

  const formattedDate = useMemo(() => {
    const locale = lang === ELang.en ? enUS : DEFAULT_DATE_LOCALE;

    return format(parseISO(date), 'EEEE, MMM d', { locale });
  }, [date, lang]);

  const isSelectedToday = useMemo(() => isToday(parseISO(date)), [date]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.sideSlot}>
          {showSearch && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Search tasks"
              onPress={onSearchPress}
              style={[
                styles.iconButton,
                isSearchVisible && styles.iconButtonActive,
              ]}
            >
              {isSearchVisible ? (
                <SearchCrossIcon width={ICON_SIZE} height={ICON_SIZE} />
              ) : (
                <SearchIcon width={ICON_SIZE} height={ICON_SIZE} />
              )}
            </TouchableOpacity>
          )}

          {showFilter && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Filter tasks"
              onPress={onFilterPress}
              style={styles.iconButton}
            >
              <FilterIcon width={ICON_SIZE} height={ICON_SIZE} fill={ICON_COLOR} />
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

      {isSearchVisible && onSearchQueryChange && (
        <View style={styles.searchContainer}>
          <Search
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            autoFocus
          />
        </View>
      )}
    </View>
  );
};

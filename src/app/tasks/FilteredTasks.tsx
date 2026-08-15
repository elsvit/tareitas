import { format, parseISO, subDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { TaskListItem } from '~/components/tasks/TaskListItem';
import { Text } from '~/components/ui';
import { DEFAULT_DATE_LOCALE, DEFAULT_LANG } from '~/constants/settings';
import { t } from '~/services';
import { RootStateT } from '~/store';
import {
  selectCurrentUser,
  selectIsChild,
  selectLang,
} from '~/store/settings/selectors';
import {
  TaskFilterSection,
  getFilteredTaskSections,
} from '~/store/tasks/taskFilters';
import { ITaskFilters } from '~/store/tasks/types';
import { ScheduledTaskItem } from '~/store/tasks/selectors';
import { Colors } from '~/styles';
import { ELang } from '~/types/ELang';
import { ETaskStatus } from '~/types/ETask';

type RouteParams = {
  startDate?: string;
  endDate?: string;
  status?: string;
  childId?: string;
  isHabit?: string | boolean;
};

const parseStatusParam = (value?: string): ETaskStatus[] | undefined => {
  if (!value) {
    return undefined;
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter((item): item is ETaskStatus =>
      Object.values(ETaskStatus).includes(item as ETaskStatus),
    );
};

const parseIsHabitParam = (value: unknown) =>
  value === true || value === 'true';

export default function FilteredTasks() {
  const { params } = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const lang = useSelector(selectLang) ?? DEFAULT_LANG;
  const currentUserId = useSelector(selectCurrentUser);
  const isChild = useSelector(selectIsChild);

  const filters = useMemo<ITaskFilters>(() => {
    const today = format(new Date(), 'yyyy-MM-dd');

    return {
      startDate: params?.startDate ?? format(subDays(new Date(), 60), 'yyyy-MM-dd'),
      endDate: params?.endDate ?? today,
      status: parseStatusParam(params?.status) ?? [ETaskStatus.Completed],
      childId: params?.childId ?? (isChild ? currentUserId ?? undefined : undefined),
      isHabit: parseIsHabitParam(params?.isHabit),
    };
  }, [params, isChild, currentUserId]);

  const formatSectionTitle = useCallback(
    (date: string) => {
      const locale = lang === ELang.en ? enUS : DEFAULT_DATE_LOCALE;

      return format(parseISO(date), 'EEEE, MMM d', { locale });
    },
    [lang],
  );

  const sections = useSelector((state: RootStateT) =>
    getFilteredTaskSections(state, filters),
  );

  const screenTitle = filters.isHabit
    ? t('habits.completed_history')
    : t('tasks.completed_history');

  const renderItem = useCallback<SectionListRenderItem<ScheduledTaskItem>>(
    ({ item }) => <TaskListItem item={item} isChildView={isChild} />,
    [isChild],
  );

  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<ScheduledTaskItem, TaskFilterSection>;
    }) => (
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" weight="bold" style={styles.sectionTitle}>
          {formatSectionTitle(section.date)}
        </Text>
      </View>
    ),
    [formatSectionTitle],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('tasks.no_filtered_tasks')}
      </Text>
    ),
    [],
  );

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={screenTitle}
        containerStyle={styles.screenHeader}
      />
      <SectionList<ScheduledTaskItem, TaskFilterSection>
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={renderSeparator}
        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        style={styles.list}
      />
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    color: Colors.blue500,
  },
  sectionGap: {
    height: 8,
  },
  separator: {
    height: 8,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
    opacity: 0.6,
  },
});

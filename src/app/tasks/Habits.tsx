import { format, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ScreenHeaderWithLogo, SelectUserPrompt } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { TaskFilterModal } from '~/components/modals';
import { TaskCalendarHeader } from '~/components/tasks/TaskCalendarHeader';
import { TaskListItem } from '~/components/tasks/TaskListItem';
import { TaskScreenFabs } from '~/components/tasks/TaskScreenFabs';
import { Text } from '~/components/ui';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useHasCompletedTasksInPast } from '~/hooks/useHasCompletedTasksInPast';
import { useTaskCalendarDate } from '~/hooks/useTaskCalendarDate';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole, selectCurrentUser } from '~/store/settings/selectors';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import {
  buildTaskListItemViewFromParts,
  ScheduledTaskItem,
  selectScheduledTasksForDate,
} from '~/store/tasks/selectors';
import { generateTasksForDate } from '~/store/tasks/slice';
import { PAST_COMPLETED_SEARCH_DAYS } from '~/store/tasks/taskFilters';
import { EScreens } from '~/types';
import { ETaskStatus } from '~/types/ETask';
import { getAssignmentFieldsForDate } from '~/utils/tasks/recurringTaskEdit';
import {
  createDefaultTaskCalendarFilter,
  getActiveTaskCalendarFilterCount,
  matchesTaskCalendarFilter,
  mergeTaskCalendarFilterChildren,
  TaskCalendarFilter,
} from '~/utils/tasks/taskCalendarFilter';
import { compareTaskTimes } from '~/utils/tasks/taskSort';

export default function Habits() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: currentUser } = useCurrentUser();
  const { selectedDate, handlePreviousDay, handleNextDay } = useTaskCalendarDate();

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentRole = useSelector(selectCurrentRole);
  const currentUserId = useSelector(selectCurrentUser);
  const isChild = currentRole === ERole.child;
  const children = useSelector(selectAllChildren);
  const taskBaseList = useSelector(selectAllTaskBase);

  const [filter, setFilter] = useState<TaskCalendarFilter>(() =>
    createDefaultTaskCalendarFilter(children),
  );

  useEffect(() => {
    setFilter(current => mergeTaskCalendarFilterChildren(current, children));
  }, [children]);

  const assignments = useSelector(selectAllTaskAssignment);

  const scheduledItems = useSelector(
    useMemo(
      () =>
        selectScheduledTasksForDate(
          selectedDate,
          isChild ? currentUserId : null,
          true,
        ),
      [selectedDate, currentUserId, isChild],
    ),
  );

  const showChildrenFilter = !isChild && children.length > 0;

  const activeFilterCount = useMemo(
    () => getActiveTaskCalendarFilterCount(filter, showChildrenFilter),
    [filter, showChildrenFilter],
  );

  const normalizedSearchQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );

  const filteredItems = useMemo(
    () =>
      scheduledItems
        .filter(item => {
          const assignment = assignments.find(
            assignmentItem => assignmentItem.id === item.assignmentId,
          );

          if (!assignment) {
            return false;
          }

          const child = children.find(childItem => childItem.id === assignment.childId);
          const taskView = buildTaskListItemViewFromParts(
            item.id,
            item.assignmentId,
            item.date,
            item.task,
            assignment,
            child,
            taskBaseList,
          );

          if (!taskView) {
            return false;
          }

          if (
            normalizedSearchQuery &&
            !taskView.name.toLowerCase().includes(normalizedSearchQuery)
          ) {
            return false;
          }

          return matchesTaskCalendarFilter(
            assignment.childId,
            taskView.status,
            filter,
            showChildrenFilter,
          );
        })
        .sort((a, b) => {
          const assignmentA = assignments.find(
            assignmentItem => assignmentItem.id === a.assignmentId,
          );
          const assignmentB = assignments.find(
            assignmentItem => assignmentItem.id === b.assignmentId,
          );

          if (!assignmentA || !assignmentB) {
            return 0;
          }

          const timeA = getAssignmentFieldsForDate(assignmentA, a.date).time;
          const timeB = getAssignmentFieldsForDate(assignmentB, b.date).time;

          return compareTaskTimes(timeA, timeB);
        }),
    [
      scheduledItems,
      assignments,
      children,
      taskBaseList,
      filter,
      showChildrenFilter,
      normalizedSearchQuery,
    ],
  );

  useEffect(() => {
    if (isChild) {
      return;
    }

    dispatch(generateTasksForDate({ date: selectedDate, assignments }));
  }, [dispatch, selectedDate, assignments, isChild]);

  const handleOpenFilter = useCallback(() => {
    setIsFilterModalVisible(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  const handleSearchPress = useCallback(() => {
    setIsSearchVisible(current => !current);
  }, []);

  const handleAddHabit = useCallback(() => {
    router.push(
      `/${EScreens.TaskAssignmentAdd}?date=${selectedDate}&isHabit=true` as any,
    );
  }, [router, selectedDate]);

  const showCompletedHistory = useHasCompletedTasksInPast(true);

  const handleOpenCompletedHistory = useCallback(() => {
    router.push({
      pathname: `/${EScreens.FilteredTasks}`,
      params: {
        startDate: format(subDays(new Date(), PAST_COMPLETED_SEARCH_DAYS), 'yyyy-MM-dd'),
        endDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        status: ETaskStatus.Completed,
        isHabit: 'true',
        ...(isChild && currentUserId ? { childId: currentUserId } : {}),
      },
    } as any);
  }, [router, isChild, currentUserId]);

  const handlePressHabit = useCallback(
    (item: ScheduledTaskItem) => {
      router.push(
        `/${EScreens.TaskAssignmentEdit}?id=${item.assignmentId}&date=${item.date}&isHabit=true` as any,
      );
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<ScheduledTaskItem>>(
    ({ item }) => (
      <TaskListItem
        item={item}
        isChildView={isChild}
        onPress={isChild ? undefined : () => handlePressHabit(item)}
      />
    ),
    [handlePressHabit, isChild],
  );

  const keyExtractor = useCallback((item: ScheduledTaskItem) => item.id, []);

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (<>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('habits.no_habits')}
      </Text>
      {!isChild && <>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {t('tasks.push_to_add_task')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {t('tasks.empty_habits_definition')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {t('tasks.empty_tasks_definition')}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {t('tasks.empty_tasks_habits_difference')}
        </Text>
      </>}
    </>
    ),
    [],
  );

  return (
    <SafeAreaBgImage>
      <ScreenHeaderWithLogo containerStyle={{ backgroundColor: 'transparent' }} />
      {!currentUser ? (
        <SelectUserPrompt />
      ) : (
        <View style={styles.container}>
          <TaskCalendarHeader
            date={selectedDate}
            onPrevious={handlePreviousDay}
            onNext={handleNextDay}
            showSearch
            isSearchVisible={isSearchVisible}
            onSearchPress={handleSearchPress}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            showFilter
            activeFilterCount={activeFilterCount}
            onFilterPress={handleOpenFilter}
          />

          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />

          <TaskScreenFabs
            showAdd={!isChild}
            onAdd={handleAddHabit}
            showCompletedHistory={showCompletedHistory}
            onOpenCompletedHistory={handleOpenCompletedHistory}
          />

          <TaskFilterModal
            isVisible={isFilterModalVisible}
            onRequestClose={handleCloseFilter}
            filter={filter}
            onFilterChange={setFilter}
            showChildrenFilter={showChildrenFilter}
          />
        </View>
      )}
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  list: {
    flex: 1,
  },

  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
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

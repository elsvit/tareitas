import { addDays, format, parseISO, subDays } from 'date-fns';
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
import { TaskCalendarHeader } from '~/components/tasks/TaskCalendarHeader';
import { TaskListItem } from '~/components/tasks/TaskListItem';
import { TaskScreenFabs } from '~/components/tasks/TaskScreenFabs';
import { Text } from '~/components/ui';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useHasCompletedTasksInPast } from '~/hooks/useHasCompletedTasksInPast';
import { t } from '~/services';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole, selectCurrentUser } from '~/store/settings/selectors';
import { PAST_COMPLETED_SEARCH_DAYS } from '~/store/tasks/taskFilters';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  ScheduledTaskItem,
  selectScheduledTasksForDate,
} from '~/store/tasks/selectors';
import { generateTasksForDate } from '~/store/tasks/slice';
import { EScreens } from '~/types';
import { ETaskStatus } from '~/types/ETask';

export default function Tasks() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: currentUser } = useCurrentUser();

  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd'),
  );

  const currentRole = useSelector(selectCurrentRole);
  const currentUserId = useSelector(selectCurrentUser);
  const isChild = currentRole === ERole.child;

  const assignments = useSelector(selectAllTaskAssignment);

  const scheduledItems = useSelector(
    useMemo(
      () =>
        selectScheduledTasksForDate(
          selectedDate,
          isChild ? currentUserId : null,
          false,
        ),
      [selectedDate, currentUserId, isChild],
    ),
  );

  useEffect(() => {
    if (isChild) {
      return;
    }

    dispatch(generateTasksForDate({ date: selectedDate, assignments }));
  }, [dispatch, selectedDate, assignments, isChild]);

  const handlePreviousDay = useCallback(() => {
    setSelectedDate(current =>
      format(subDays(parseISO(current), 1), 'yyyy-MM-dd'),
    );
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate(current =>
      format(addDays(parseISO(current), 1), 'yyyy-MM-dd'),
    );
  }, []);

  const handleAddTask = useCallback(() => {
    router.push(`/${EScreens.TaskAssignmentAdd}?date=${selectedDate}` as any);
  }, [router, selectedDate]);

  const showCompletedHistory = useHasCompletedTasksInPast(false);

  const handleOpenCompletedHistory = useCallback(() => {
    router.push({
      pathname: `/${EScreens.FilteredTasks}`,
      params: {
        startDate: format(subDays(new Date(), PAST_COMPLETED_SEARCH_DAYS), 'yyyy-MM-dd'),
        endDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        status: ETaskStatus.Completed,
        isHabit: 'false',
        ...(isChild && currentUserId ? { childId: currentUserId } : {}),
      },
    } as any);
  }, [router, isChild, currentUserId]);

  const handlePressTask = useCallback(
    (item: ScheduledTaskItem) => {
      router.push(
        `/${EScreens.TaskAssignmentEdit}?id=${item.assignmentId}` as any,
      );
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<ScheduledTaskItem>>(
    ({ item }) => (
      <TaskListItem
        item={item}
        isChildView={isChild}
        onPress={isChild ? undefined : () => handlePressTask(item)}
      />
    ),
    [handlePressTask, isChild],
  );

  const keyExtractor = useCallback((item: ScheduledTaskItem) => item.id, []);

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('tasks.no_tasks')}
      </Text>
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
        />

        <FlatList
          data={scheduledItems}
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
          onAdd={handleAddTask}
          showCompletedHistory={showCompletedHistory}
          onOpenCompletedHistory={handleOpenCompletedHistory}
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

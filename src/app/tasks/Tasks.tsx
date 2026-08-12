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

import bgImgSrc from '~/assets/img/bg.png';
import PlusIcon from '~/assets/svg/common/plus.svg';
import { ScreenHeaderWithLogo } from '~/components/blocks';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { TaskCalendarHeader } from '~/components/tasks/TaskCalendarHeader';
import { TaskListItem } from '~/components/tasks/TaskListItem';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole, selectCurrentUser } from '~/store/settings/selectors';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  ScheduledTaskItem,
  selectScheduledTasksForDate,
  selectTasksByDate,
} from '~/store/tasks/selectors';
import { generateTasksForDate } from '~/store/tasks/slice';
import { Colors } from '~/styles';
import { EScreens } from '~/types';

export default function Tasks() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd'),
  );

  const currentRole = useSelector(selectCurrentRole);
  const currentUserId = useSelector(selectCurrentUser);
  const isChild = currentRole === ERole.child;

  const assignments = useSelector(selectAllTaskAssignment);

  const parentTaskList = useSelector(
    useMemo(() => selectTasksByDate(selectedDate), [selectedDate]),
  );

  const childTaskList = useSelector(
    useMemo(
      () => selectScheduledTasksForDate(selectedDate, currentUserId),
      [selectedDate, currentUserId],
    ),
  );

  const scheduledItems = useMemo<ScheduledTaskItem[]>(() => {
    if (isChild) {
      return childTaskList;
    }

    return parentTaskList.map(task => ({
      id: task.id,
      assignmentId: task.assignmentId,
      date: task.date,
      task,
    }));
  }, [childTaskList, isChild, parentTaskList]);

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
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <ScreenHeaderWithLogo containerStyle={{ backgroundColor: 'transparent' }} />
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

        {!isChild && (
          <View style={styles.fab}>
            <IconButton
              Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
              onPress={handleAddTask}
              size={56}
            />
          </View>
        )}
      </View>
    </SafeAreaBackground>
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

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 8,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.blue500,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

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

import PlusIcon from '~/assets/svg/common/plus.svg';
import { ScreenHeaderWithLogo, SelectUserPrompt } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { TaskCalendarHeader } from '~/components/tasks/TaskCalendarHeader';
import { TaskListItem } from '~/components/tasks/TaskListItem';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { t } from '~/services';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole, selectCurrentUser } from '~/store/settings/selectors';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  ScheduledTaskItem,
  selectScheduledTasksForDate,
} from '~/store/tasks/selectors';
import { generateTasksForDate } from '~/store/tasks/slice';
import { Colors } from '~/styles';
import { EScreens } from '~/types';

export default function Habits() {
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
          true,
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

  const handleAddHabit = useCallback(() => {
    router.push(
      `/${EScreens.TaskAssignmentAdd}?date=${selectedDate}&isHabit=true` as any,
    );
  }, [router, selectedDate]);

  const handlePressHabit = useCallback(
    (item: ScheduledTaskItem) => {
      router.push(
        `/${EScreens.TaskAssignmentEdit}?id=${item.assignmentId}&isHabit=true` as any,
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
    () => (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('habits.no_habits')}
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

          {!isChild && (
            <View style={styles.fab}>
              <IconButton
                Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
                onPress={handleAddHabit}
                size={56}
              />
            </View>
          )}
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

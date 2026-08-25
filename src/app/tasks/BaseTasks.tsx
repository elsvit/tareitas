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
import SearchCrossIcon from '~/assets/svg/common/search-cross.svg';
import SearchIcon from '~/assets/svg/common/search.svg';
import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ResetModal } from '~/components/modals';
import { TaskBaseListItem } from '~/components/tasks/TaskBaseListItem';
import { Button, Search, Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { selectIsAdmin, selectIsParent } from '~/store/settings/selectors';
import { selectAllTaskBaseInDefaultOrder } from '~/store/taskBase/selectors';
import { resetTaskBase, syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { Colors } from '~/styles';
import { EScreens } from '~/types';
import { ITaskBase } from '~/types/ITask';

export default function BaseTasks() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const taskBaseList = useSelector(selectAllTaskBaseInDefaultOrder);
  const canManageBaseTasks = useSelector(selectIsParent);
  const isAdmin = useSelector(selectIsAdmin);

  useEffect(() => {
    dispatch(syncTaskBaseTranslations());
  }, [dispatch]);

  const normalizedSearchQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );

  const filteredTaskBaseList = useMemo(
    () =>
      normalizedSearchQuery
        ? taskBaseList.filter(item =>
            item.name.toLowerCase().includes(normalizedSearchQuery),
          )
        : taskBaseList,
    [taskBaseList, normalizedSearchQuery],
  );

  const handleAddTask = useCallback(() => {
    if (!canManageBaseTasks) {
      return;
    }

    router.push(`/${EScreens.BaseTaskAdd}`);
  }, [canManageBaseTasks, router]);

  const handleResetTasks = useCallback(() => {
    dispatch(resetTaskBase());
  }, [dispatch]);

  const handleOpenResetModal = useCallback(() => {
    setIsResetModalVisible(true);
  }, []);

  const handleSearchPress = useCallback(() => {
    setIsSearchVisible(current => !current);
  }, []);

  const handlePressTask = useCallback((id: string) => {
    if (!canManageBaseTasks) {
      return;
    }

    router.push(`/${EScreens.BaseTaskEdit}?id=${id}`);
  }, [canManageBaseTasks, router]);

  const renderItem = useCallback<ListRenderItem<ITaskBase>>(
    ({ item }) => {
      const handlePress = () => {
        handlePressTask(item.id);
      };

      return (
        <TaskBaseListItem
          name={item.name}
          description={item.description}
          picture={item.picture}
          reward={item.reward}
          color={item.color}
          subtasks={item.subtasks}
          onPress={canManageBaseTasks ? handlePress : undefined}
        />
      );
    }, [canManageBaseTasks, handlePressTask],
  );

  const keyExtractor = useCallback(
    (item: ITaskBase) => item.id,
    [],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('tasks.no_base_tasks')}
      </Text>
    ),
    [],
  );

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('tasks.base_tasks')}
        containerStyle={styles.screenHeader}
        rightButtons={[
          {
            icon: isSearchVisible ? SearchCrossIcon : SearchIcon,
            onPress: handleSearchPress,
          },
        ]}
      />
      <View style={styles.container}>
        {isSearchVisible && (
          <View style={styles.searchContainer}>
            <Search
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {isAdmin && (
          <View style={styles.header}>
            <Button mode="contained" onPress={handleOpenResetModal}>
              {t('button.reset')}
            </Button>
          </View>
        )}

        <FlatList
          data={filteredTaskBaseList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {canManageBaseTasks && (
          <View style={styles.fab}>
            <IconButton
              Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
              onPress={handleAddTask}
              size={56}
            />
          </View>
        )}
      </View>

      <ResetModal
        isVisible={isResetModalVisible}
        onRequestClose={() => setIsResetModalVisible(false)}
        onConfirm={handleResetTasks}
      />
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },

  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },

  searchContainer: {
    marginBottom: 8,
  },

  listContent: {
    flexGrow: 1,
    paddingBottom: 96,
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
    bottom: 24,

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
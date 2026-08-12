import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useHeaderHeight } from '@react-navigation/elements';

import bgImgSrc from '~/assets/img/bg.png';
import PlusIcon from '~/assets/svg/common/plus.svg';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ResetModal } from '~/components/modals';
import { TaskBaseListItem } from '~/components/tasks/TaskBaseListItem';
import { Button, Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { t } from '~/services';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { resetTaskBase } from '~/store/taskBase/slice';
import { Colors } from '~/styles';
import { EScreens } from '~/types';
import { ITaskBase } from '~/types/ITask';

export default function BaseTasks() {
  useI18nHeaderTitle('tasks.base_tasks');

  const dispatch = useDispatch();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const taskBaseList = useSelector(selectAllTaskBase);

  const handleAddTask = useCallback(() => {
    router.push(`/${EScreens.BaseTaskAdd}`);
  }, [router]);

  const handleResetTasks = useCallback(() => {
    dispatch(resetTaskBase());
  }, [dispatch]);

  const handleOpenResetModal = useCallback(() => {
    setIsResetModalVisible(true);
  }, []);

  const handlePressTask = useCallback((id: string) => {
    router.push(`/${EScreens.BaseTaskEdit}?id=${id}`);
  }, [router]);

  const renderItem = useCallback<ListRenderItem<ITaskBase>>(
    ({ item }) => {
      const handlePress = () => {
        console.log('TEST_42 handlePress', item.id);
        handlePressTask(item.id);
      };
      return (
        <TaskBaseListItem
          name={item.name}
          description={item.description}
          picture={item.picture}
          reward={item.reward}
          onPress={handlePress}
        />
      );
    }, [handlePressTask]
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
    <SafeAreaBackground bgImg={bgImgSrc}>
      <View style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.header}>
          <Button mode="outlined" onPress={handleOpenResetModal}>
            {t('button.reset')}
          </Button>
        </View>

        <FlatList
          data={taskBaseList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.fab}>
          <IconButton
            Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
            onPress={handleAddTask}
            size={56}
          />
        </View>
      </View>

      <ResetModal
        isVisible={isResetModalVisible}
        onRequestClose={() => setIsResetModalVisible(false)}
        onConfirm={handleResetTasks}
      />
    </SafeAreaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
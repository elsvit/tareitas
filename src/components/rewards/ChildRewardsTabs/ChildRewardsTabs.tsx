import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { RewardItem } from '~/components/rewards/RewardItem';
import { Text } from '~/components/ui';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { t } from '~/services';
import {
  RewardListItemView,
  selectChildApprovedRewardItems,
  selectChildCompletedRewardItems,
  selectChildRewardBalance,
  selectChildSelectedRewardItems,
  selectRewardListItemsForChild,
} from '~/store/rewards/selectors';
import {
  addReward,
  removeReward,
  updateReward,
} from '~/store/rewards/slice';
import { Colors, spacing } from '~/styles';
import { ERewardStatus } from '~/types/EReward';

type ChildTabRoute = {
  key: 'rewards' | 'selected' | 'approved' | 'completed';
  title: string;
};

const childTabRoutes: ChildTabRoute[] = [
  { key: 'rewards', title: 'rewards' },
  { key: 'selected', title: 'selected' },
  { key: 'approved', title: 'approved' },
  { key: 'completed', title: 'completed' },
];

const getTabTitle = (key: ChildTabRoute['key']) => {
  switch (key) {
    case 'rewards':
      return t('rewards.tabs.rewards');
    case 'selected':
      return t('rewards.tabs.selected');
    case 'approved':
      return t('rewards.tabs.approved');
    case 'completed':
      return t('rewards.tabs.completed');
  }
};

function useChildRewardActions(childId: string) {
  const dispatch = useDispatch();

  const handleChildSelect = useCallback(
    (item: RewardListItemView) => {
      if (!childId) {
        return;
      }

      if (item.instance?.status === ERewardStatus.Rejected) {
        dispatch(
          updateReward({
            entity: {
              ...item.instance,
              status: ERewardStatus.Selected,
              updatedAt: new Date().toISOString(),
            },
          }),
        );

        return;
      }

      if (item.instance) {
        return;
      }

      dispatch(
        addReward({
          entity: {
            id: uuidv4(),
            rewardAssignmentId: item.assignmentId,
            childId,
            status: ERewardStatus.Selected,
            createdAt: new Date().toISOString(),
          },
        }),
      );
    },
    [childId, dispatch],
  );

  const handleChildRedeem = useCallback(
    (instanceId: string) => {
      dispatch(removeReward({ entity: instanceId }));
    },
    [dispatch],
  );

  return { handleChildSelect, handleChildRedeem };
}

function ChildRewardsCatalogTab({ childId }: { childId: string }) {
  const childBalance = useSelector(selectChildRewardBalance(childId));
  const items = useSelector(selectRewardListItemsForChild(childId));
  const { handleChildSelect, handleChildRedeem } = useChildRewardActions(childId);

  const renderItem = useCallback<ListRenderItem<RewardListItemView>>(
    ({ item }) => (
      <RewardItem
        title={item.title}
        picture={item.picture}
        reward={item.reward}
        mode="child"
        status={item.status}
        canAfford={item.canAfford}
        onSelect={() => handleChildSelect(item)}
        onCancelPending={
          item.instance?.status === ERewardStatus.Selected
            ? () => handleChildRedeem(item.instance!.id)
            : undefined
        }
        onRedeem={
          item.instance ? () => handleChildRedeem(item.instance!.id) : undefined
        }
      />
    ),
    [handleChildRedeem, handleChildSelect],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => `${item.assignmentId}_${item.status ?? 'available'}`}
      extraData={childBalance}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_rewards')}</Text>
      }
    />
  );
}

function ChildSelectedRewardsTab({ childId }: { childId: string }) {
  const childBalance = useSelector(selectChildRewardBalance(childId));
  const items = useSelector(selectChildSelectedRewardItems(childId));
  const { handleChildRedeem } = useChildRewardActions(childId);

  const renderItem = useCallback<ListRenderItem<RewardListItemView>>(
    ({ item }) => (
      <RewardItem
        title={item.title}
        picture={item.picture}
        reward={item.reward}
        mode="child"
        status={item.status}
        canAfford={item.canAfford}
        onCancelPending={() => handleChildRedeem(item.instance!.id)}
        onRedeem={() => handleChildRedeem(item.instance!.id)}
      />
    ),
    [handleChildRedeem],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      extraData={childBalance}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_selected')}</Text>
      }
    />
  );
}

function ChildApprovedRewardsTab({ childId }: { childId: string }) {
  const items = useSelector(selectChildApprovedRewardItems(childId));

  const renderItem = useCallback<ListRenderItem<RewardListItemView>>(
    ({ item }) => (
      <RewardItem
        title={item.title}
        picture={item.picture}
        reward={item.reward}
        mode="child"
        status={item.status}
        canAfford={item.canAfford}
      />
    ),
    [],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_approved')}</Text>
      }
    />
  );
}

function ChildCompletedRewardsTab({ childId }: { childId: string }) {
  const items = useSelector(selectChildCompletedRewardItems(childId));

  const renderItem = useCallback<ListRenderItem<RewardListItemView>>(
    ({ item }) => (
      <RewardItem
        title={item.title}
        picture={item.picture}
        reward={item.reward}
        mode="completed"
        completedDate={item.completedDate}
      />
    ),
    [],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_completed')}</Text>
      }
    />
  );
}

export function ChildRewardsTabs() {
  const layout = useWindowDimensions();
  const { currentUserId } = useCurrentUser();
  const childId = currentUserId ?? '';
  const [index, setIndex] = useState(0);

  const routes = useMemo(
    () =>
      childTabRoutes.map(route => ({
        ...route,
        title: getTabTitle(route.key),
      })),
    [],
  );

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case 'rewards':
          return <ChildRewardsCatalogTab childId={childId} />;
        case 'selected':
          return <ChildSelectedRewardsTab childId={childId} />;
        case 'approved':
          return <ChildApprovedRewardsTab childId={childId} />;
        case 'completed':
          return <ChildCompletedRewardsTab childId={childId} />;
        default:
          return null;
      }
    },
    [childId],
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          scrollEnabled
          activeColor={Colors.blue500}
          inactiveColor={Colors.blue500}
          indicatorStyle={styles.tabIndicator}
          style={styles.tabBar}
          tabStyle={styles.tab}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIndicator: {
    backgroundColor: Colors.blue500,
    height: 3,
  },
  tab: {
    width: 'auto',
    minWidth: 88,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing(4),
    paddingTop: spacing(2),
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
});

export default ChildRewardsTabs;

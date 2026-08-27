import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  SectionListRenderItem,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useDispatch, useSelector, useStore } from 'react-redux';

import PlusIcon from '~/assets/svg/common/plus.svg';
import { ConfirmModal } from '~/components/modals';
import { RewardHistoryItem } from '~/components/rewards/RewardHistoryItem';
import { RewardItem } from '~/components/rewards/RewardItem';
import { SegmentedSectionList } from '~/components/rewards/SegmentedSectionList';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { RootStateT } from '~/store';
import { selectAllRewardAssignment } from '~/store/rewardAssignment/selectors';
import { isDateInClosedRewardPeriod } from '~/store/rewards/earnedRewardPeriodUtils';
import {
  buildPeriodApprovalUpdates,
} from '~/store/rewards/rewardCalculations';
import {
  HistoryPeriodItem,
  selectApprovedRewardsByChildSections,
  selectCompletedRewardsByChildSections,
  selectEarnedRewardPeriods,
  selectSelectedRewardsByChildSections,
  selectUnapprovedHistorySections,
} from '~/store/rewards/selectors';
import { approvePeriod, updateReward } from '~/store/rewards/slice';
import { selectCanReviewTasks } from '~/store/settings/selectors';
import { Colors, spacing } from '~/styles';
import { EScreens } from '~/types';
import { ERewardStatus } from '~/types/EReward';
import { IReward, IRewardAssignment } from '~/types/IReward';

type ParentTabRoute = {
  key: 'selected' | 'approved' | 'completed' | 'rewards' | 'history';
  title: string;
};

const parentTabRoutes: ParentTabRoute[] = [
  { key: 'rewards', title: 'rewards' },
  { key: 'selected', title: 'selected' },
  { key: 'approved', title: 'approved' },
  { key: 'completed', title: 'completed' },
  { key: 'history', title: 'history' },
];

const getRewardStatusDate = (reward: IReward) =>
  reward.completedDate ??
  (reward.createdAt
    ? reward.createdAt.slice(0, 10)
    : format(new Date(), 'yyyy-MM-dd'));

function SelectedRewardsTab() {
  const dispatch = useDispatch();
  const canReviewRewards = useSelector(selectCanReviewTasks);
  const selectedSections = useSelector(selectSelectedRewardsByChildSections);
  const earnedRewardPeriods = useSelector(selectEarnedRewardPeriods);

  const isRewardStatusLocked = useCallback(
    (reward: IReward) =>
      isDateInClosedRewardPeriod(
        earnedRewardPeriods,
        reward.childId,
        getRewardStatusDate(reward),
      ),
    [earnedRewardPeriods],
  );

  const handleParentApprove = useCallback(
    (reward: IReward) => {
      if (!canReviewRewards || isRewardStatusLocked(reward)) {
        return;
      }

      dispatch(
        updateReward({
          entity: {
            ...reward,
            status: ERewardStatus.Approved,
            updatedAt: new Date().toISOString(),
          },
        }),
      );
    },
    [canReviewRewards, dispatch, isRewardStatusLocked],
  );

  const handleParentReject = useCallback(
    (reward: IReward) => {
      if (!canReviewRewards || isRewardStatusLocked(reward)) {
        return;
      }

      dispatch(
        updateReward({
          entity: {
            ...reward,
            status: ERewardStatus.Rejected,
            updatedAt: new Date().toISOString(),
          },
        }),
      );
    },
    [canReviewRewards, dispatch, isRewardStatusLocked],
  );

  const renderSelectedItem = useCallback<
    SectionListRenderItem<
      { reward: IReward; assignment: IRewardAssignment },
      { childId: string; title: string; currentReward: number }
    >
  >(
    ({ item }) => (
      <RewardItem
        title={item.assignment.title}
        picture={item.assignment.picture}
        reward={item.assignment.reward}
        mode="parentSelected"
        status={item.reward.status}
        onApprove={() => handleParentApprove(item.reward)}
        onReject={() => handleParentReject(item.reward)}
      />
    ),
    [handleParentApprove, handleParentReject],
  );

  const sections = useMemo(
    () =>
      selectedSections.map(section => ({
        ...section,
        subtitle: `${t('rewards.current_reward')}: ⭐ ${section.currentReward}`,
      })),
    [selectedSections],
  );

  return (
    <SegmentedSectionList
      sections={sections}
      keyExtractor={item => item.reward.id}
      renderItem={renderSelectedItem}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_selected')}</Text>
      }
    />
  );
}

function ApprovedRewardsTab() {
  const dispatch = useDispatch();
  const canReviewRewards = useSelector(selectCanReviewTasks);
  const approvedSections = useSelector(selectApprovedRewardsByChildSections);
  const earnedRewardPeriods = useSelector(selectEarnedRewardPeriods);

  const isRewardStatusLocked = useCallback(
    (reward: IReward) =>
      isDateInClosedRewardPeriod(
        earnedRewardPeriods,
        reward.childId,
        getRewardStatusDate(reward),
      ),
    [earnedRewardPeriods],
  );

  const handleParentReject = useCallback(
    (reward: IReward) => {
      if (!canReviewRewards || isRewardStatusLocked(reward)) {
        return;
      }

      dispatch(
        updateReward({
          entity: {
            ...reward,
            status: ERewardStatus.Rejected,
            updatedAt: new Date().toISOString(),
          },
        }),
      );
    },
    [canReviewRewards, dispatch, isRewardStatusLocked],
  );

  const handleParentComplete = useCallback(
    (reward: IReward) => {
      if (!canReviewRewards || isRewardStatusLocked(reward)) {
        return;
      }

      dispatch(
        updateReward({
          entity: {
            ...reward,
            status: ERewardStatus.Approved,
            completedDate: format(new Date(), 'yyyy-MM-dd'),
            updatedAt: new Date().toISOString(),
          },
        }),
      );
    },
    [canReviewRewards, dispatch, isRewardStatusLocked],
  );

  const renderApprovedItem = useCallback<
    SectionListRenderItem<
      { reward: IReward; assignment: IRewardAssignment },
      { childId: string; title: string; currentReward: number }
    >
  >(
    ({ item }) => (
      <RewardItem
        title={item.assignment.title}
        picture={item.assignment.picture}
        reward={item.assignment.reward}
        mode="parentApproved"
        status={item.reward.status}
        onReject={() => handleParentReject(item.reward)}
        onComplete={() => handleParentComplete(item.reward)}
      />
    ),
    [handleParentComplete, handleParentReject],
  );

  const sections = useMemo(
    () =>
      approvedSections.map(section => ({
        ...section,
        subtitle: `${t('rewards.current_reward')}: ⭐ ${section.currentReward}`,
      })),
    [approvedSections],
  );

  return (
    <SegmentedSectionList
      sections={sections}
      keyExtractor={item => item.reward.id}
      renderItem={renderApprovedItem}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_approved')}</Text>
      }
    />
  );
}

function CompletedRewardsTab() {
  const completedSections = useSelector(selectCompletedRewardsByChildSections);

  const renderCompletedItem = useCallback<
    SectionListRenderItem<
      { reward: IReward; assignment: IRewardAssignment },
      { childId: string; title: string }
    >
  >(
    ({ item }) => (
      <RewardItem
        title={item.assignment.title}
        picture={item.assignment.picture}
        reward={item.assignment.reward}
        mode="completed"
        completedDate={item.reward.completedDate}
      />
    ),
    [],
  );

  return (
    <SegmentedSectionList
      sections={completedSections}
      keyExtractor={item => item.reward.id}
      renderItem={renderCompletedItem}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{t('rewards.no_completed')}</Text>
      }
    />
  );
}

function RewardsListTab() {
  const router = useRouter();
  const rewardAssignments = useSelector(selectAllRewardAssignment);

  const handleAddReward = useCallback(() => {
    router.push(`/${EScreens.RewardAdd}` as any);
  }, [router]);

  const handleEditReward = useCallback(
    (id: string) => {
      router.push(`/${EScreens.RewardEdit}?id=${id}` as any);
    },
    [router],
  );

  const renderAssignmentItem = useCallback<ListRenderItem<IRewardAssignment>>(
    ({ item }) => (
      <RewardItem
        title={item.title}
        picture={item.picture}
        reward={item.reward}
        mode="assignment"
        onPress={() => handleEditReward(item.id)}
      />
    ),
    [handleEditReward],
  );

  return (
    <View style={styles.listTab}>
      <FlatList
        data={rewardAssignments}
        renderItem={renderAssignmentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('rewards.no_rewards')}</Text>
        }
      />
      <View style={styles.fab}>
        <IconButton
          Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
          onPress={handleAddReward}
          size={56}
        />
      </View>
    </View>
  );
}

function HistoryRewardsTab() {
  const dispatch = useDispatch();
  const store = useStore<RootStateT>();
  const historySections = useSelector(selectUnapprovedHistorySections);
  const [approvePeriodModal, setApprovePeriodModal] = useState<{
    childId: string;
    childName: string;
    yearMonth: string;
  } | null>(null);

  const handleApprovePeriodPress = useCallback(
    (item: HistoryPeriodItem) => {
      setApprovePeriodModal({
        childId: item.childId,
        childName: item.childName,
        yearMonth: item.yearMonth,
      });
    },
    [],
  );

  const handleConfirmApprovePeriod = useCallback(() => {
    if (!approvePeriodModal) {
      return;
    }

    const state = store.getState();
    const updates = buildPeriodApprovalUpdates(
      state,
      approvePeriodModal.childId,
      approvePeriodModal.yearMonth,
    );

    if (updates.length > 0) {
      dispatch(
        approvePeriod({
          childId: approvePeriodModal.childId,
          updates,
        }),
      );
    }

    setApprovePeriodModal(null);
  }, [approvePeriodModal, dispatch, store]);

  const renderHistoryItem = useCallback(
    ({ item }: { item: HistoryPeriodItem }) => (
      <RewardHistoryItem
        childName={item.childName}
        remainingRewardFromPreviousMonths={item.remainingRewardFromPreviousMonths}
        monthReward={item.monthReward}
        canApprovePeriod={item.canApprovePeriod}
        onApprovePeriod={() => handleApprovePeriodPress(item)}
      />
    ),
    [handleApprovePeriodPress],
  );

  return (
    <>
      <SegmentedSectionList<HistoryPeriodItem>
        sections={historySections}
        keyExtractor={item => `${item.childId}_${item.yearMonth}`}
        renderItem={renderHistoryItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('rewards.no_history')}</Text>
        }
      />
      <ConfirmModal
        isVisible={!!approvePeriodModal}
        onRequestClose={() => setApprovePeriodModal(null)}
        onConfirm={handleConfirmApprovePeriod}
        title={t('rewards.approve_period')}
        message={t('rewards.approve_period_confirm')}
      />
    </>
  );
}

const renderScene = SceneMap({
  selected: SelectedRewardsTab,
  approved: ApprovedRewardsTab,
  completed: CompletedRewardsTab,
  rewards: RewardsListTab,
  history: HistoryRewardsTab,
});

const getTabTitle = (key: ParentTabRoute['key']) => {
  switch (key) {
    case 'selected':
      return t('rewards.tabs.selected');
    case 'approved':
      return t('rewards.tabs.approved');
    case 'completed':
      return t('rewards.tabs.completed');
    case 'rewards':
      return t('rewards.tabs.rewards');
    case 'history':
      return t('rewards.tabs.history');
  }
};

export function ParentRewardsTabs() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = useMemo(
    () =>
      parentTabRoutes.map(route => ({
        ...route,
        title: getTabTitle(route.key),
      })),
    [],
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
  listTab: {
    flex: 1,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

export default ParentRewardsTabs;

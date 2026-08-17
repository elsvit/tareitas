import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { ScreenHeaderWithLogo, SelectUserPrompt } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ParentRewardsTabs } from '~/components/rewards/ParentRewardsTabs';
import { RewardItem } from '~/components/rewards/RewardItem';
import { Text } from '~/components/ui';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useSyncEarnedRewardPeriods } from '~/hooks/useSyncEarnedRewardPeriods';
import { t } from '~/services';
import {
  RewardListItemView,
  selectChildRewardBalance,
  selectRewardListItemsForChild,
} from '~/store/rewards/selectors';
import {
  addReward,
  removeReward,
  updateReward,
} from '~/store/rewards/slice';
import { ERewardStatus } from '~/types/EReward';

export default function Rewards() {
  const dispatch = useDispatch();
  const { user: currentUser, isChild } = useCurrentUser();
  const childId = isChild ? currentUser?.id ?? '' : '';

  useSyncEarnedRewardPeriods();

  const childBalance = useSelector(selectChildRewardBalance(childId));
  const childRewardItems = useSelector(selectRewardListItemsForChild(childId));

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

  const renderChildItem = useCallback<ListRenderItem<RewardListItemView>>(
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
    [handleChildSelect, handleChildRedeem],
  );

  return (
    <SafeAreaBgImage includeBottomInset={false}>
      <ScreenHeaderWithLogo containerStyle={{ backgroundColor: 'transparent' }} />
      {!currentUser ? (
        <SelectUserPrompt />
      ) : isChild ? (
        <View style={styles.container}>
          <FlatList
            data={childRewardItems}
            renderItem={renderChildItem}
            keyExtractor={item => `${item.assignmentId}_${item.status ?? 'available'}`}
            extraData={childBalance}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('rewards.no_rewards')}</Text>
            }
          />
        </View>
      ) : (
        <View style={styles.container}>
          <ParentRewardsTabs />
        </View>
      )}
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
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

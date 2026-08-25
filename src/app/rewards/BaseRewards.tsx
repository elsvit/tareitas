import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { RewardBaseListItem } from '~/components/rewards/RewardBaseListItem';
import { Button, Search, Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { selectAllRewardBase } from '~/store/rewardBase/selectors';
import { resetRewardBase } from '~/store/rewardBase/slice';
import { selectIsAdmin, selectIsParent } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { EScreens } from '~/types';
import { IRewardBase } from '~/types/IReward';

export default function BaseRewards() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const rewardBaseList = useSelector(selectAllRewardBase);
  const canManageBaseRewards = useSelector(selectIsParent);
  const isAdmin = useSelector(selectIsAdmin);

  const normalizedSearchQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );

  const filteredRewardBaseList = useMemo(
    () =>
      normalizedSearchQuery
        ? rewardBaseList.filter(item =>
            item.title.toLowerCase().includes(normalizedSearchQuery),
          )
        : rewardBaseList,
    [rewardBaseList, normalizedSearchQuery],
  );

  const handleAddReward = useCallback(() => {
    if (!canManageBaseRewards) {
      return;
    }

    router.push(`/${EScreens.BaseRewardAdd}` as any);
  }, [canManageBaseRewards, router]);

  const handleResetRewards = useCallback(() => {
    dispatch(resetRewardBase());
  }, [dispatch]);

  const handleOpenResetModal = useCallback(() => {
    setIsResetModalVisible(true);
  }, []);

  const handleSearchPress = useCallback(() => {
    setIsSearchVisible(current => !current);
  }, []);

  const handlePressReward = useCallback((id: string) => {
    if (!canManageBaseRewards) {
      return;
    }

    router.push(`/${EScreens.BaseRewardEdit}?id=${id}` as any);
  }, [canManageBaseRewards, router]);

  const renderItem = useCallback<ListRenderItem<IRewardBase>>(
    ({ item }) => {
      const handlePress = () => {
        handlePressReward(item.id);
      };

      return (
        <RewardBaseListItem
          title={item.title}
          picture={item.picture}
          reward={item.reward}
          onPress={canManageBaseRewards ? handlePress : undefined}
        />
      );
    },
    [canManageBaseRewards, handlePressReward],
  );

  const keyExtractor = useCallback(
    (item: IRewardBase) => item.id,
    [],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('rewards.no_base_rewards')}
      </Text>
    ),
    [],
  );

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('rewards.base_rewards')}
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
              placeholder={t('rewards.search_by_title')}
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
          data={filteredRewardBaseList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {canManageBaseRewards && (
          <View style={styles.fab}>
            <IconButton
              Icon={<PlusIcon width={32} height={32} fill="#FFFFFF" />}
              onPress={handleAddReward}
              size={56}
            />
          </View>
        )}
      </View>

      <ResetModal
        isVisible={isResetModalVisible}
        onRequestClose={() => setIsResetModalVisible(false)}
        onConfirm={handleResetRewards}
        title={t('rewards.reset_base_rewards')}
        message={t('rewards.reset_base_rewards_confirm')}
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

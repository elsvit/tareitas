import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import bgImgSrc from '~/assets/img/bg.png';
import PlusIcon from '~/assets/svg/common/plus.svg';
import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ResetModal } from '~/components/modals';
import { RewardBaseListItem } from '~/components/rewards/RewardBaseListItem';
import { Button, Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { t } from '~/services';
import { selectAllRewardBase } from '~/store/rewardBase/selectors';
import { resetRewardBase } from '~/store/rewardBase/slice';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { EScreens } from '~/types';
import { IRewardBase } from '~/types/IReward';

export default function BaseRewards() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const rewardBaseList = useSelector(selectAllRewardBase);
  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;

  const handleAddReward = useCallback(() => {
    if (!isAdmin) {
      return;
    }

    router.push(`/${EScreens.BaseRewardAdd}` as any);
  }, [isAdmin, router]);

  const handleResetRewards = useCallback(() => {
    dispatch(resetRewardBase());
  }, [dispatch]);

  const handleOpenResetModal = useCallback(() => {
    setIsResetModalVisible(true);
  }, []);

  const handlePressReward = useCallback((id: string) => {
    if (!isAdmin) {
      return;
    }

    router.push(`/${EScreens.BaseRewardEdit}?id=${id}` as any);
  }, [isAdmin, router]);

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
          onPress={isAdmin ? handlePress : undefined}
        />
      );
    },
    [handlePressReward, isAdmin],
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
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <ScreenHeader
        hasBackButton
        title={t('rewards.base_rewards')}
        containerStyle={styles.screenHeader}
      />
      <View style={styles.container}>
        {isAdmin && (
          <View style={styles.header}>
            <Button mode="contained" onPress={handleOpenResetModal}>
              {t('button.reset')}
            </Button>
          </View>
        )}

        <FlatList
          data={rewardBaseList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {isAdmin && (
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
    </SafeAreaBackground>
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

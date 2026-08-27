import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import CrossIcon from '~/assets/svg/common/cross.svg';
import { ConfirmModal } from '~/components/modals';
import { ButtonColors, Text } from '~/components/ui';
import { deleteImageFromDevice } from '~/components/ui/ImageLoader/ImageLoader.utils';
import { t } from '~/services';
import { isRemoteImageRef } from '~/services/imageSync';
import {
  deleteFamilyImage,
  removeRewardImageUrl,
  removeTaskImageUrl,
  removeUserImageUrl,
  selectFamilyScopedRewardImageEntries,
  selectFamilyScopedTaskImageEntries,
  selectFamilyScopedUserImageEntries,
  selectUsedRewardImageIds,
  selectUsedTaskImageIds,
  selectUsedUserImageIds,
} from '~/store/images';
import type { ImageStoreKind } from '~/store/images/types';
import {
  selectCanReviewTasks,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { syncFamilyImages } from '~/store/settings/slice';
import { Colors } from '~/styles';

import { styles } from './styles';

type PendingDelete = {
  kind: ImageStoreKind;
  id: string;
  uri: string;
};

type ImageGridProps = {
  entries: [string, string][];
  usedIds: Set<string>;
  canRemoveUnused: boolean;
  onRemovePress: (id: string, uri: string) => void;
};

const ImageGrid: React.FC<ImageGridProps> = ({
  entries,
  usedIds,
  canRemoveUnused,
  onRemovePress,
}) => {
  if (entries.length === 0) {
    return (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('more.loaded_images_empty')}
      </Text>
    );
  }

  return (
    <View style={styles.grid}>
      {entries.map(([id, uri]) => {
        const isInUse = usedIds.has(id);
        const showRemove = canRemoveUnused && !isInUse;

        return (
          <View key={id} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />

            {showRemove && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('more.remove_loaded_image')}
                onPress={() => onRemovePress(id, uri)}
                style={styles.removeButton}
              >
                <CrossIcon width={12} height={12} fill="#FFFFFF" />
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
};

type PhotoSectionProps = {
  title: string;
  titleColor: string;
  entries: [string, string][];
  usedIds: Set<string>;
  canRemoveUnused: boolean;
  onRemovePress: (id: string, uri: string) => void;
};

const PhotoSection: React.FC<PhotoSectionProps> = ({
  title,
  titleColor,
  entries,
  usedIds,
  canRemoveUnused,
  onRemovePress,
}) => (
  <View style={styles.section}>
    <Text variant="titleMedium" weight="bold" style={{ color: titleColor }}>
      {title}
    </Text>
    <ImageGrid
      entries={entries}
      usedIds={usedIds}
      canRemoveUnused={canRemoveUnused}
      onRemovePress={onRemovePress}
    />
  </View>
);

export function LoadedPhotosContent() {
  const dispatch = useDispatch();
  const isMultidevice = useSelector(selectIsMultidevice);
  const canManageImages = useSelector(selectCanReviewTasks);
  const canRemoveUnused = !isMultidevice || canManageImages;

  const userEntries = useSelector(selectFamilyScopedUserImageEntries);
  const taskEntries = useSelector(selectFamilyScopedTaskImageEntries);
  const rewardEntries = useSelector(selectFamilyScopedRewardImageEntries);
  const usedUserIds = useSelector(selectUsedUserImageIds);
  const usedTaskIds = useSelector(selectUsedTaskImageIds);
  const usedRewardIds = useSelector(selectUsedRewardImageIds);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isMultidevice) {
        dispatch(syncFamilyImages());
      }
    }, [dispatch, isMultidevice]),
  );

  const handleRemovePress = useCallback(
    (kind: ImageStoreKind, id: string, uri: string) => {
      setPendingDelete({ kind, id, uri });
    },
    [],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }

    const { kind, id, uri } = pendingDelete;

    if (isMultidevice && isRemoteImageRef(id)) {
      dispatch(
        deleteFamilyImage({
          kind,
          path: id,
          uri,
        }),
      );
    } else {
      if (kind === 'task') {
        dispatch(removeTaskImageUrl(id));
      } else if (kind === 'reward') {
        dispatch(removeRewardImageUrl(id));
      } else {
        dispatch(removeUserImageUrl(id));
      }

      await deleteImageFromDevice(uri);
    }

    setPendingDelete(null);
  }, [dispatch, isMultidevice, pendingDelete]);

  return (
    <>
      <View style={styles.container}>
        <PhotoSection
          title={t('users.title')}
          titleColor={Colors.blue500}
          entries={userEntries}
          usedIds={usedUserIds}
          canRemoveUnused={canRemoveUnused}
          onRemovePress={(id, uri) => handleRemovePress('user', id, uri)}
        />

        <PhotoSection
          title={t('tasks.title')}
          titleColor={Colors.green500}
          entries={taskEntries}
          usedIds={usedTaskIds}
          canRemoveUnused={canRemoveUnused}
          onRemovePress={(id, uri) => handleRemovePress('task', id, uri)}
        />

        <PhotoSection
          title={t('rewards.title')}
          titleColor={Colors.gold500}
          entries={rewardEntries}
          usedIds={usedRewardIds}
          canRemoveUnused={canRemoveUnused}
          onRemovePress={(id, uri) => handleRemovePress('reward', id, uri)}
        />
      </View>

      <ConfirmModal
        isVisible={!!pendingDelete}
        onRequestClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('more.remove_loaded_image_title')}
        message={t('more.remove_loaded_image_message')}
        confirmLabel={t('button.delete')}
        confirmBgColor={ButtonColors.Red}
      />
    </>
  );
}

export default LoadedPhotosContent;

import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';

import CrossIcon from '~/assets/svg/common/cross.svg';
import { ConfirmModal } from '~/components/modals';
import { ButtonColors, Text } from '~/components/ui';
import { deleteImageFromDevice } from '~/components/ui/ImageLoader/ImageLoader.utils';
import { t } from '~/services';
import {
  removeRewardImageUrl,
  removeTaskImageUrl,
  removeUserImageUrl,
  selectRewardImageUrls,
  selectTaskImageUrls,
  selectUsedRewardImageIds,
  selectUsedTaskImageIds,
  selectUsedUserImageIds,
  selectUserImageUrls,
} from '~/store/images';
import type { ImageStoreKind } from '~/store/images/types';
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
  onRemovePress: (id: string, uri: string) => void;
};

const ImageGrid: React.FC<ImageGridProps> = ({
  entries,
  usedIds,
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

        return (
          <View key={id} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />

            {!isInUse && (
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
  onRemovePress: (id: string, uri: string) => void;
};

const PhotoSection: React.FC<PhotoSectionProps> = ({
  title,
  titleColor,
  entries,
  usedIds,
  onRemovePress,
}) => (
  <View style={styles.section}>
    <Text variant="titleMedium" weight="bold" style={{ color: titleColor }}>
      {title}
    </Text>
    <ImageGrid
      entries={entries}
      usedIds={usedIds}
      onRemovePress={onRemovePress}
    />
  </View>
);

export function LoadedPhotosContent() {
  const dispatch = useDispatch();

  const userUrls = useSelector(selectUserImageUrls);
  const taskUrls = useSelector(selectTaskImageUrls);
  const rewardUrls = useSelector(selectRewardImageUrls);
  const usedUserIds = useSelector(selectUsedUserImageIds);
  const usedTaskIds = useSelector(selectUsedTaskImageIds);
  const usedRewardIds = useSelector(selectUsedRewardImageIds);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const userEntries = useMemo(() => Object.entries(userUrls), [userUrls]);
  const taskEntries = useMemo(() => Object.entries(taskUrls), [taskUrls]);
  const rewardEntries = useMemo(() => Object.entries(rewardUrls), [rewardUrls]);

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

    if (kind === 'task') {
      dispatch(removeTaskImageUrl(id));
    } else if (kind === 'reward') {
      dispatch(removeRewardImageUrl(id));
    } else {
      dispatch(removeUserImageUrl(id));
    }

    await deleteImageFromDevice(uri);
    setPendingDelete(null);
  }, [dispatch, pendingDelete]);

  return (
    <>
      <View style={styles.container}>
        <PhotoSection
          title={t('users.title')}
          titleColor={Colors.blue500}
          entries={userEntries}
          usedIds={usedUserIds}
          onRemovePress={(id, uri) => handleRemovePress('user', id, uri)}
        />

        <PhotoSection
          title={t('tasks.title')}
          titleColor={Colors.green500}
          entries={taskEntries}
          usedIds={usedTaskIds}
          onRemovePress={(id, uri) => handleRemovePress('task', id, uri)}
        />

        <PhotoSection
          title={t('rewards.title')}
          titleColor={Colors.gold500}
          entries={rewardEntries}
          usedIds={usedRewardIds}
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

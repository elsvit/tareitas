import React, { useState } from 'react';

import { useMediaSessionPause } from '~/hooks/useSessionPause';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';

import HelpCircleIcon from '~/assets/svg/common/help-circle.svg';
import { DeleteModal } from '~/components/modals';
import { IconButton } from '~/components/ui/IconButton';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { useResolvedMediaUrl } from '~/hooks/useResolvedMediaUrl';
import {
  selectFamilyId,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { touchSessionActivity } from '~/store/settings/slice';
import type { AppDispatch } from '~/store';
import { Colors } from '~/styles';
import { ISubtask } from '~/types/ITask';
import {
  clearPendingSubtaskPhotoCapture,
  saveSubtaskPhotoFromAsset,
  setPendingSubtaskPhotoCapture,
  type PendingSubtaskPhotoCapture,
} from '~/utils/tasks/pendingSubtaskPhotoCapture';
import { getRemoteImageCachePolicy } from '~/utils/imageCache';
import { deleteSubtaskPhotoFromDevice } from '~/utils/tasks/subtaskPhotoStorage';

import { PhotoPreviewModal } from './PhotoPreviewModal';
import { styles } from './SubtaskCompletion.styles';

type Props = {
  subtask: ISubtask;
  photoUrl?: string;
  checked: boolean;
  disabled?: boolean;
  isCaptureDisabled?: boolean;
  showSubscriptionHelp?: boolean;
  onSubscriptionHelpPress?: () => void;
  captureContext: Omit<PendingSubtaskPhotoCapture, 'subtaskValue' | 'previousPhotoUrl'>;
  onPhotoComplete: (url: string) => void;
  onDelete: () => void;
};

export function SubtaskPhotoRow({
  subtask,
  photoUrl,
  checked,
  disabled = false,
  isCaptureDisabled = false,
  showSubscriptionHelp = false,
  onSubscriptionHelpPress,
  captureContext,
  onPhotoComplete,
  onDelete,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const familyId = useSelector(selectFamilyId);
  const isMultidevice = useSelector(selectIsMultidevice);
  const resolvedPhotoUrl = useResolvedMediaUrl(photoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraFlowActive, setIsCameraFlowActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useMediaSessionPause(isCameraFlowActive || isSaving);

  const handleTakePhoto = async () => {
    if (disabled || isCaptureDisabled || isSaving || isCameraFlowActive) {
      return;
    }

    setIsCameraFlowActive(true);
    setError(null);
    dispatch(touchSessionActivity());

    let shouldClearPendingCapture = true;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setError(t('tasks.subtask_photo_permission_denied'));
        return;
      }

      await setPendingSubtaskPhotoCapture({
        ...captureContext,
        subtaskValue: subtask.value,
        previousPhotoUrl: photoUrl,
      });
      shouldClearPendingCapture = false;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.4,
        allowsEditing: false,
        exif: false,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        shouldClearPendingCapture = true;
        return;
      }

      setIsSaving(true);

      const nextValue = await saveSubtaskPhotoFromAsset(result.assets[0], {
        familyId,
        isMultidevice,
        previousPhotoUrl: photoUrl,
      });

      if (!nextValue) {
        setError(t('tasks.subtask_photo_failed'));
        return;
      }

      onPhotoComplete(nextValue);
      shouldClearPendingCapture = true;
    } catch (saveError) {
      if (__DEV__) {
        console.error('Subtask photo save failed', saveError);
      }

      setError(t('tasks.subtask_photo_failed'));
      shouldClearPendingCapture = true;
    } finally {
      if (shouldClearPendingCapture) {
        await clearPendingSubtaskPhotoCapture();
      }

      setIsSaving(false);
      setIsCameraFlowActive(false);
    }
  };

  const handleDelete = async () => {
    if (disabled || isSaving || !photoUrl) {
      return;
    }

    if (photoUrl.startsWith('file://')) {
      await deleteSubtaskPhotoFromDevice(photoUrl);
    }

    onDelete();
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalVisible(false);
    void handleDelete();
  };

  const hasPhoto = !!photoUrl;

  return (
    <View>
      <View style={styles.row}>
        <View
          style={[
            styles.checkbox,
            checked && styles.checkboxChecked,
            styles.checkboxDisabled,
          ]}
        >
          {checked ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (hasPhoto) {
              setIsPreviewVisible(true);
            }
          }}
          disabled={!hasPhoto}
          style={[
            styles.photoThumb,
            !hasPhoto && styles.iconActionButtonDisabled,
          ]}
        >
          {resolvedPhotoUrl ? (
            <Image
              source={{ uri: resolvedPhotoUrl }}
              style={styles.photoThumb}
              contentFit="cover"
              cachePolicy={getRemoteImageCachePolicy(resolvedPhotoUrl)}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons
                name="image-outline"
                size={18}
                color={Colors.grey700}
              />
            </View>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tasks.record_delete')}
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={disabled || isSaving || !hasPhoto}
          style={[
            styles.iconActionButton,
            (disabled || isSaving || !hasPhoto) &&
              styles.iconActionButtonDisabled,
          ]}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color={Colors.grey800}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tasks.subtask_add_photo')}
          onPress={() => void handleTakePhoto()}
          disabled={disabled || isCaptureDisabled || isSaving}
          style={[
            styles.iconActionButton,
            (disabled || isCaptureDisabled || isSaving) &&
              styles.iconActionButtonDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.grey800} size="small" />
          ) : (
            <MaterialCommunityIcons
              name="camera"
              size={22}
              color={Colors.grey800}
            />
          )}
        </Pressable>

        {showSubscriptionHelp ? (
          <IconButton
            Icon={<HelpCircleIcon width={22} height={22} />}
            onPress={() => onSubscriptionHelpPress?.()}
            size={32}
            accessibilityLabel={t('subscription.modal_title')}
          />
        ) : null}

        <Text style={styles.label}>{subtask.label}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PhotoPreviewModal
        visible={isPreviewVisible}
        imageUri={resolvedPhotoUrl}
        onRequestClose={() => setIsPreviewVisible(false)}
      />

      <DeleteModal
        isVisible={isDeleteModalVisible}
        title={t('tasks.subtask_photo_delete_title')}
        message={t('tasks.subtask_photo_delete_confirm')}
        onRequestClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

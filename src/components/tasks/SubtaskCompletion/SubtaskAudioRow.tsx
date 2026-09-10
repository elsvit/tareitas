import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { useSelector } from 'react-redux';

import { useMediaSessionPause } from '~/hooks/useSessionPause';
import HelpCircleIcon from '~/assets/svg/common/help-circle.svg';
import { DeleteModal } from '~/components/modals';
import { TaskRecordPlayControl } from '~/components/tasks/TaskRecordPlayControl';
import { IconButton } from '~/components/ui/IconButton';
import { Text } from '~/components/ui';
import { SUBTASK_RECORD_MAX_DURATION, TASK_RECORDING_OPTIONS } from '~/constants/taskRecord';
import { trackSubtaskRecordUsed } from '~/services/analytics';
import { t } from '~/services';
import { uploadFamilyTaskRecordWithSession } from '~/services/api/uploadFamilyTaskRecord';
import {
  selectFamilyId,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { ISubtask } from '~/types/ITask';
import { createId } from '~/utils/createId';
import {
  deleteTaskRecordFromDevice,
  saveTaskRecordToDevice,
} from '~/utils/tasks/taskRecordStorage';

import { styles } from './SubtaskCompletion.styles';

type Props = {
  subtask: ISubtask;
  audioUrl?: string;
  checked: boolean;
  disabled?: boolean;
  isCaptureDisabled?: boolean;
  showSubscriptionHelp?: boolean;
  onSubscriptionHelpPress?: () => void;
  onRecordComplete: (url: string) => void;
  onDelete: () => void;
};

export function SubtaskAudioRow({
  subtask,
  audioUrl,
  checked,
  disabled = false,
  isCaptureDisabled = false,
  showSubscriptionHelp = false,
  onSubscriptionHelpPress,
  onRecordComplete,
  onDelete,
}: Props) {
  const familyId = useSelector(selectFamilyId);
  const isMultidevice = useSelector(selectIsMultidevice);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const recorder = useAudioRecorder(TASK_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 250);
  const isRecording = recorderState.isRecording;

  useMediaSessionPause(isRecording || isSaving);

  const recordingSeconds = Math.min(
    SUBTASK_RECORD_MAX_DURATION,
    Math.floor(recorderState.durationMillis / 1000),
  );

  const stopRecording = useCallback(async () => {
    if (!recorderState.isRecording) {
      return;
    }

    await recorder.stop();

    const uri = recorder.uri ?? recorder.getStatus().url;

    if (!uri) {
      setError(t('tasks.record_failed'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const recordId = createId();
      const localUri = await saveTaskRecordToDevice(uri, recordId);
      let nextValue = localUri;

      if (isMultidevice && familyId) {
        try {
          const uploaded = await uploadFamilyTaskRecordWithSession(
            familyId,
            localUri,
          );

          if (uploaded.path) {
            nextValue = uploaded.path;
          }
        } catch (uploadError) {
          if (__DEV__) {
            console.warn(
              'Subtask record upload failed, keeping local file',
              uploadError,
            );
          }

          setError(
            uploadError instanceof Error
              ? uploadError.message
              : t('tasks.record_failed'),
          );
        }
      }

      if (!nextValue) {
        setError(t('tasks.record_failed'));
        return;
      }

      if (audioUrl?.startsWith('file://')) {
        await deleteTaskRecordFromDevice(audioUrl);
      }

      onRecordComplete(nextValue);
      void trackSubtaskRecordUsed();
    } catch (saveError) {
      if (__DEV__) {
        console.error('Subtask record save failed', saveError);
      }

      setError(t('tasks.record_failed'));
    } finally {
      setIsSaving(false);
    }
  }, [
    audioUrl,
    familyId,
    isMultidevice,
    onRecordComplete,
    recorder,
    recorderState.isRecording,
  ]);

  useEffect(() => {
    if (
      !recorderState.isRecording ||
      recordingSeconds < SUBTASK_RECORD_MAX_DURATION
    ) {
      return;
    }

    void stopRecording();
  }, [recorderState.isRecording, recordingSeconds, stopRecording]);

  const startRecording = async () => {
    if (disabled || isCaptureDisabled || isSaving || isRecording) {
      return;
    }

    setError(null);

    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      setError(t('tasks.record_permission_denied'));
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await recorder.prepareToRecordAsync();
    recorder.record({
      forDuration: SUBTASK_RECORD_MAX_DURATION,
    });
  };

  const handleRecordPress = () => {
    if (isRecording) {
      void stopRecording();
      return;
    }

    void startRecording();
  };

  const handleDelete = async () => {
    if (disabled || isSaving || isRecording || !audioUrl) {
      return;
    }

    if (audioUrl.startsWith('file://')) {
      await deleteTaskRecordFromDevice(audioUrl);
    }

    onDelete();
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalVisible(false);
    void handleDelete();
  };

  const hasAudio = !!audioUrl;
  const isRecordControlDisabled =
    disabled || isCaptureDisabled || isSaving;
  const isPlaybackDisabled = disabled || isSaving || isRecording;

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

        {hasAudio ? (
          <TaskRecordPlayControl
            audioRecord={audioUrl}
            variant="button"
            buttonStyle={styles.iconActionButton}
            iconSize={22}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled
            style={[styles.iconActionButton, styles.iconActionButtonDisabled]}
          >
            <MaterialCommunityIcons
              name="play-circle"
              size={22}
              color={Colors.grey800}
            />
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tasks.record_delete')}
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={isPlaybackDisabled || !hasAudio}
          style={[
            styles.iconActionButton,
            (isPlaybackDisabled || !hasAudio) &&
              styles.iconActionButtonDisabled,
          ]}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color={Colors.grey800}
          />
        </Pressable>

        {hasAudio ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isRecording ? t('tasks.record_pause') : t('tasks.record')
            }
            onPress={handleRecordPress}
            disabled={isRecordControlDisabled}
            style={[
              styles.iconActionButton,
              isRecordControlDisabled && styles.iconActionButtonDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.grey800} size="small" />
            ) : (
              <MaterialCommunityIcons
                name={isRecording ? 'stop' : 'microphone'}
                size={22}
                color={Colors.grey800}
              />
            )}
          </Pressable>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isRecording ? t('tasks.record_pause') : t('tasks.record')
              }
              onPress={handleRecordPress}
              disabled={isRecordControlDisabled}
              style={[
                styles.iconActionButton,
                isRecordControlDisabled && styles.iconActionButtonDisabled,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.grey800} size="small" />
              ) : (
                <MaterialCommunityIcons
                  name={isRecording ? 'stop' : 'microphone'}
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
          </>
        )}

        <Text style={styles.label}>{subtask.label}</Text>
      </View>

      {isRecording ? (
        <Text style={styles.errorText}>
          {t('tasks.record_timer', {
            seconds: recordingSeconds,
            max: SUBTASK_RECORD_MAX_DURATION,
          })}
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <DeleteModal
        isVisible={isDeleteModalVisible}
        title={t('tasks.subtask_record_delete_title')}
        message={t('tasks.subtask_record_delete_confirm')}
        onRequestClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

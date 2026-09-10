import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { useSelector } from 'react-redux';

import HelpCircleIcon from '~/assets/svg/common/help-circle.svg';
import { SubscriptionModal } from '~/components/subscriptions/SubscriptionModal';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import {
  TASKS_RECORD_MAX_SECONDS,
  TASKS_RECORDS_MAXIMUN,
  TASKS_RECORDS_WITHOUT_SUBSCRIPTION,
} from '~/constants/ads';
import { TASK_RECORDING_OPTIONS } from '~/constants/taskRecord';
import { useIsPro, useProFeatureAccess } from '~/hooks/useIsPro';
import { useSubscription } from '~/hooks/useSubscription';
import { t } from '~/services';
import { uploadFamilyTaskRecordWithSession } from '~/services/api/uploadFamilyTaskRecord';
import { useResolvedMediaUrl } from '~/hooks/useResolvedMediaUrl';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  selectFamilyId,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { Colors } from '~/styles';
import { createId } from '~/utils/createId';
import { canAddTaskRecord } from '~/utils/tasks/taskRecordLimits';
import {
  deleteTaskRecordFromDevice,
  saveTaskRecordToDevice,
} from '~/utils/tasks/taskRecordStorage';

import { styles } from './TaskRecordField.styles';

type Props = {
  value?: string | null;
  initialValue?: string | null;
  onChange?: (value: string | null) => void;
  recordDate: string;
  assignmentId?: string;
  disabled?: boolean;
};

export function TaskRecordField({
  value,
  initialValue = null,
  onChange,
  recordDate,
  assignmentId,
  disabled = false,
}: Props) {
  const hasProFeatureAccess = useProFeatureAccess();
  const { isPro } = useIsPro();
  const subscription = useSubscription();
  const assignments = useSelector(selectAllTaskAssignment);
  const familyId = useSelector(selectFamilyId);
  const isMultidevice = useSelector(selectIsMultidevice);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markedDeleted, setMarkedDeleted] = useState(false);

  const savedValue = initialValue ?? null;
  const playbackValue = value ?? (markedDeleted ? savedValue : null);
  const playbackSource = useResolvedMediaUrl(playbackValue);
  const player = useAudioPlayer(markedDeleted ? null : playbackSource);
  const playerStatus = useAudioPlayerStatus(player);

  const recorder = useAudioRecorder(TASK_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 250);

  const limits = useMemo(
    () =>
      canAddTaskRecord({
        assignments,
        date: recordDate,
        assignmentId,
        isPro: hasProFeatureAccess,
        withoutSubscriptionLimit:
          TASKS_RECORDS_WITHOUT_SUBSCRIPTION,
        maximumLimit: TASKS_RECORDS_MAXIMUN,
      }),
    [assignments, assignmentId, hasProFeatureAccess, recordDate],
  );

  const isRecording = recorderState.isRecording;
  const recordingSeconds = Math.min(
    TASKS_RECORD_MAX_SECONDS,
    Math.floor(recorderState.durationMillis / 1000),
  );

  const hasPendingAudioChange = useMemo(() => {
    if (markedDeleted) {
      return true;
    }

    return (value ?? null) !== savedValue;
  }, [markedDeleted, savedValue, value]);

  useEffect(() => {
    setMarkedDeleted(false);
  }, [savedValue]);

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

          nextValue = uploaded.path;
        } catch (uploadError) {
          if (__DEV__) {
            console.warn(
              'Task record upload failed, keeping local file',
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

      if (value?.startsWith('file://') && value !== savedValue) {
        await deleteTaskRecordFromDevice(value);
      }

      setMarkedDeleted(false);
      onChange?.(nextValue);
    } catch (saveError) {
      if (__DEV__) {
        console.error('Task record save failed', saveError);
      }

      setError(t('tasks.record_failed'));
    } finally {
      setIsSaving(false);
    }
  }, [
    familyId,
    isMultidevice,
    onChange,
    recorder,
    recorderState.isRecording,
    savedValue,
    value,
  ]);

  useEffect(() => {
    if (
      !recorderState.isRecording ||
      recordingSeconds < TASKS_RECORD_MAX_SECONDS
    ) {
      return;
    }

    void stopRecording();
  }, [recorderState.isRecording, recordingSeconds, stopRecording]);

  const handleSubscribe = useCallback(async () => {
    const success = await subscription.subscribe();

    if (success) {
      setIsSubscriptionModalVisible(false);
    }
  }, [subscription]);

  const startRecording = async () => {
    if (disabled || limits.isRecordDisabled || isSaving) {
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
      forDuration: TASKS_RECORD_MAX_SECONDS,
    });
  };

  const handleDelete = async () => {
    if (disabled || isRecording || isSaving || markedDeleted) {
      return;
    }

    const currentValue = value ?? null;
    const isNewRecording = !!currentValue && currentValue !== savedValue;

    if (isNewRecording) {
      await deleteTaskRecordFromDevice(currentValue);
      setMarkedDeleted(false);
      onChange?.(savedValue);
      return;
    }

    if (!currentValue && !savedValue) {
      return;
    }

    setMarkedDeleted(!!savedValue);
    onChange?.(null);
  };

  const handlePlay = () => {
    if (markedDeleted || !playbackSource) {
      return;
    }

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    if (
      playerStatus.currentTime > 0 &&
      playerStatus.currentTime < (playerStatus.duration || 0)
    ) {
      player.play();
      return;
    }

    player.seekTo(0);
    player.play();
  };

  const isRecordControlDisabled =
    disabled ||
    isSaving ||
    (!isRecording && limits.isRecordDisabled);

  const isPlaybackDisabled = markedDeleted || isRecording || isSaving;
  const showExistingControls = !!value || markedDeleted;

  const handleRecordPress = () => {
    if (isRecording) {
      void stopRecording();
      return;
    }

    void startRecording();
  };

  const renderRecordButton = () => (
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
        <ActivityIndicator color={Colors.grey800} />
      ) : (
        <MaterialCommunityIcons
          name={isRecording ? 'stop' : 'microphone'}
          size={24}
          color={Colors.grey800}
        />
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {showExistingControls ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                playerStatus.playing
                  ? t('tasks.record_pause')
                  : t('tasks.record_play')
              }
              onPress={handlePlay}
              disabled={isPlaybackDisabled}
              style={[
                styles.iconActionButton,
                isPlaybackDisabled && styles.iconActionButtonDisabled,
              ]}
            >
              <MaterialCommunityIcons
                name={playerStatus.playing ? 'pause-circle' : 'play-circle'}
                size={24}
                color={Colors.grey800}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tasks.record_delete')}
              onPress={() => void handleDelete()}
              disabled={isPlaybackDisabled}
              style={[
                styles.iconActionButton,
                isPlaybackDisabled && styles.iconActionButtonDisabled,
              ]}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={Colors.grey800}
              />
            </Pressable>
            {renderRecordButton()}
          </>
        ) : (
          <>
            {renderRecordButton()}
            {limits.showSubscriptionHelp ? (
              <IconButton
                Icon={<HelpCircleIcon width={22} height={22} />}
                onPress={() => setIsSubscriptionModalVisible(true)}
                size={32}
                accessibilityLabel={t('subscription.modal_title')}
              />
            ) : null}
          </>
        )}
      </View>

      <View style={styles.timerSlot}>
        {hasPendingAudioChange ? (
          <Text variant="bodySmall" style={styles.pendingSaveText}>
            {t('tasks.record_press_save')}
          </Text>
        ) : (
          <Text
            variant="bodySmall"
            style={[
              styles.timerText,
              !isRecording && styles.timerTextHidden,
            ]}
          >
            {t('tasks.record_timer', {
              seconds: recordingSeconds,
              max: TASKS_RECORD_MAX_SECONDS,
            })}
          </Text>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <SubscriptionModal
        isVisible={isSubscriptionModalVisible}
        onRequestClose={() => setIsSubscriptionModalVisible(false)}
        onSubscribe={handleSubscribe}
        onRestore={subscription.restore}
        isLoading={subscription.isLoading}
        isPurchasing={subscription.isPurchasing}
        yearlyPrice={subscription.yearlyPrice}
        isAvailable={subscription.isAvailable}
        isPro={isPro}
        error={subscription.error}
      />
    </View>
  );
}

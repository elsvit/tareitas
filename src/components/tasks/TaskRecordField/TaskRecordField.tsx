import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  RecordingPresets,
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
  TASKS_RECORDS_MAXIMUM,
  TASKS_RECORDS_WITHOUT_SUBSCRIPTION,
} from '~/constants/ads';
import { useIsPro } from '~/hooks/useIsPro';
import { useSubscription } from '~/hooks/useSubscription';
import { t } from '~/services';
import { uploadFamilyTaskRecordWithSession } from '~/services/api/uploadFamilyTaskRecord';
import { toAbsoluteUploadUrl } from '~/services/api/uploadsApi';
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
  onChange?: (value: string | undefined) => void;
  recordDate: string;
  disabled?: boolean;
};

export function TaskRecordField({
  value,
  onChange,
  recordDate,
  disabled = false,
}: Props) {
  const { isPro } = useIsPro();
  const subscription = useSubscription();
  const assignments = useSelector(selectAllTaskAssignment);
  const familyId = useSelector(selectFamilyId);
  const isMultidevice = useSelector(selectIsMultidevice);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const playbackSource = useMemo(() => {
    if (!value) {
      return null;
    }

    return toAbsoluteUploadUrl(value) ?? value;
  }, [value]);
  const player = useAudioPlayer(playbackSource);
  const playerStatus = useAudioPlayerStatus(player);

  const limits = useMemo(
    () =>
      canAddTaskRecord({
        assignments,
        date: recordDate,
        hasExistingRecord: !!value,
        isPro,
        withoutSubscriptionLimit:
          TASKS_RECORDS_WITHOUT_SUBSCRIPTION,
        maximumLimit: TASKS_RECORDS_MAXIMUM,
      }),
    [assignments, isPro, recordDate, value],
  );

  const isRecording = recorderState.isRecording;
  const recordingSeconds = Math.min(
    TASKS_RECORD_MAX_SECONDS,
    Math.floor(recorderState.durationMillis / 1000),
  );

  const stopRecording = useCallback(async () => {
    if (!recorderState.isRecording) {
      return;
    }

    await recorder.stop();

    const uri = recorder.uri;

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
        const uploaded = await uploadFamilyTaskRecordWithSession(
          familyId,
          localUri,
        );

        nextValue = uploaded.path;
      }

      if (value) {
        await deleteTaskRecordFromDevice(value);
      }

      onChange?.(nextValue);
    } catch {
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
    await deleteTaskRecordFromDevice(value);
    onChange?.(undefined);
  };

  const handlePlay = () => {
    if (!playbackSource) {
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('tasks.record')}</Text>

      {!value ? (
        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={isRecording ? stopRecording : startRecording}
            disabled={
              disabled ||
              isSaving ||
              (!isRecording && limits.isRecordDisabled)
            }
            style={[
              styles.recordButton,
              (disabled ||
                isSaving ||
                (!isRecording && limits.isRecordDisabled)) &&
                styles.recordButtonDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <MaterialCommunityIcons
                name={isRecording ? 'stop' : 'microphone'}
                size={22}
                color={Colors.white}
              />
            )}
          </Pressable>

          {limits.showSubscriptionHelp ? (
            <IconButton
              Icon={<HelpCircleIcon width={22} height={22} />}
              onPress={() => setIsSubscriptionModalVisible(true)}
              size={32}
              accessibilityLabel={t('subscription.modal_title')}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePlay}
            style={styles.actionChip}
          >
            <Text style={styles.actionChipText}>
              {playerStatus.playing
                ? t('tasks.record_pause')
                : t('tasks.record_play')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleDelete}
            style={styles.actionChip}
          >
            <Text style={styles.actionChipText}>
              {t('tasks.record_delete')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={startRecording}
            disabled={disabled || limits.isRecordDisabled || isSaving}
            style={[
              styles.actionChip,
              (disabled || limits.isRecordDisabled || isSaving) &&
                styles.actionChipDisabled,
            ]}
          >
            <Text style={styles.actionChipText}>
              {t('tasks.record_again')}
            </Text>
          </Pressable>
        </View>
      )}

      {isRecording ? (
        <Text style={styles.timerText}>
          {t('tasks.record_timer', {
            seconds: recordingSeconds,
            max: TASKS_RECORD_MAX_SECONDS,
          })}
        </Text>
      ) : null}

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

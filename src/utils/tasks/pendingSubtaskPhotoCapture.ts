import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';

import { uploadFamilyImageWithSession } from '~/services/api/uploadFamilyImageWithSession';
import { store } from '~/store/store';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { selectTaskById } from '~/store/tasks/selectors';
import { updateTask } from '~/store/tasks/slice';
import {
  selectFamilyId,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { ETaskStatus } from '~/types/ETask';
import { createId } from '~/utils/createId';
import {
  areAllSubtasksComplete,
  buildTaskCompletionUpdate,
  upsertSubtaskCompletionMedia,
  withSubtaskMarkedComplete,
} from '~/utils/tasks/subtaskCompletion';
import {
  deleteSubtaskPhotoFromDevice,
  saveSubtaskPhotoToDevice,
} from '~/utils/tasks/subtaskPhotoStorage';

const STORAGE_KEY = 'pending_subtask_photo_capture_v1';

export type PendingSubtaskPhotoCapture = {
  taskId: string;
  assignmentId: string;
  date: string;
  subtaskValue: string;
  previousPhotoUrl?: string;
};

export async function setPendingSubtaskPhotoCapture(
  capture: PendingSubtaskPhotoCapture,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(capture));
}

export async function clearPendingSubtaskPhotoCapture(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function readPendingSubtaskPhotoCapture(): Promise<
  PendingSubtaskPhotoCapture | null
> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingSubtaskPhotoCapture;
  } catch {
    await clearPendingSubtaskPhotoCapture();
    return null;
  }
}

export async function saveSubtaskPhotoFromAsset(
  asset: ImagePickerAsset,
  options: {
    familyId: string | null;
    isMultidevice: boolean;
    previousPhotoUrl?: string;
  },
): Promise<string> {
  const photoId = createId();
  const localUri = await saveSubtaskPhotoToDevice(
    asset.uri,
    photoId,
    asset.width,
    asset.height,
  );
  let nextValue = localUri;

  if (options.isMultidevice && options.familyId) {
    try {
      const uploaded = await uploadFamilyImageWithSession(
        options.familyId,
        localUri,
        'task',
      );

      if (uploaded.path) {
        nextValue = uploaded.path;
      }
    } catch (uploadError) {
      if (__DEV__) {
        console.warn(
          'Subtask photo upload failed, keeping local file',
          uploadError,
        );
      }
    }
  }

  if (options.previousPhotoUrl?.startsWith('file://')) {
    await deleteSubtaskPhotoFromDevice(options.previousPhotoUrl);
  }

  return nextValue;
}

function dispatchSubtaskPhotoCompletion(
  capture: PendingSubtaskPhotoCapture,
  photoUrl: string,
): void {
  const state = store.getState();
  const task = selectTaskById(state, capture.taskId);
  const assignment = selectTaskAssignmentById(capture.assignmentId)(state);
  const subtasks = assignment?.subtasks ?? [];
  const nextPhotos = upsertSubtaskCompletionMedia(
    task?.completedPhotos,
    capture.subtaskValue,
    photoUrl,
  );
  const nextCompleted = withSubtaskMarkedComplete(
    capture.subtaskValue,
    task?.completedSubtasks ?? [],
  );
  const allDone = areAllSubtasksComplete(
    subtasks,
    nextCompleted,
    task?.completedAudioRecords,
    nextPhotos,
  );

  store.dispatch(
    updateTask({
      entity: buildTaskCompletionUpdate(
        task,
        capture.assignmentId,
        capture.date,
        {
          status: allDone ? ETaskStatus.Completed : ETaskStatus.Pending,
          completedSubtasks: nextCompleted,
          completedAudioRecords: task?.completedAudioRecords,
          completedPhotos: nextPhotos,
        },
      ),
    }),
  );
}

export async function recoverPendingSubtaskPhotoCapture(): Promise<boolean> {
  const capture = await readPendingSubtaskPhotoCapture();

  if (!capture) {
    return false;
  }

  const pickerResult = await ImagePicker.getPendingResultAsync();

  if (
    !pickerResult ||
    pickerResult.canceled ||
    !pickerResult.assets?.[0]?.uri
  ) {
    await clearPendingSubtaskPhotoCapture();
    return false;
  }

  try {
    const state = store.getState();
    const photoUrl = await saveSubtaskPhotoFromAsset(
      pickerResult.assets[0],
      {
        familyId: selectFamilyId(state),
        isMultidevice: selectIsMultidevice(state),
        previousPhotoUrl: capture.previousPhotoUrl,
      },
    );

    dispatchSubtaskPhotoCompletion(capture, photoUrl);
    await clearPendingSubtaskPhotoCapture();

    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to recover pending subtask photo', error);
    }

    await clearPendingSubtaskPhotoCapture();
    return false;
  }
}

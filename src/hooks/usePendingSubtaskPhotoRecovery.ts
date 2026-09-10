import { useEffect } from 'react';

import { recoverPendingSubtaskPhotoCapture } from '~/utils/tasks/pendingSubtaskPhotoCapture';

let hasAttemptedRecovery = false;

/** Recover a subtask photo when Android restarts the app after the camera closes. */
export function usePendingSubtaskPhotoRecovery(enabled: boolean) {
  useEffect(() => {
    if (!enabled || hasAttemptedRecovery) {
      return;
    }

    hasAttemptedRecovery = true;

    void recoverPendingSubtaskPhotoCapture();
  }, [enabled]);
}

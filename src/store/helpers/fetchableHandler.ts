import {
  Effect,
  // ActionPattern,
  // ActionMatchingPattern,
  Action,
} from '@redux-saga/types';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, takeLatest, ForkEffect, put } from 'redux-saga/effects';
import { Saga } from '~/store';
import { setError, setLoaded, setLoading } from '~/store/common';
import { ActionApiT } from '~/store/common';
import { mapApiError } from '~/services/api/mapApiError';
import { showErrorToast } from '~/services/toast/showAppToast';

export function* captureError(_error: unknown, _context?: unknown) {
  // Toast is shown in withFetchable catch; keep hook for future error tracking.
}

/**
 * Prototype of shared saga error handler.
 *
 * @param saga
 * @param onError
 * @param context
 */
export const withFetchable = ({
  saga,
  onError,
  context,
  actionType,
}: {
  saga: Saga;
  onError?: Effect;
  context?: any;
  actionType: ActionApiT;
}) =>
  function* withFatchableSaga(action: PayloadAction<any>) {
    try {
      // Pass only the action type string, not the entire action creator
      yield put(setLoading({ actionType: actionType.type }));
      yield call(saga, action);
      yield put(setLoaded({ actionType: actionType.type }));
    } catch (error: any) {
      yield captureError(error, context);

      // Convert Error object to serializable IError format
      const serializableError = mapApiError(error);

      yield put(
        setError({
          actionType: actionType.type,
          error: serializableError,
        }),
      );

      showErrorToast(serializableError.message);

      if (onError != null) {
        yield onError;
      }
    }
  };

export function takeLatestWithFetchable<
  A extends Action,
  Fn extends (...args: any[]) => any,
>(
  actionType: ActionApiT,
  saga: Fn,
  options?: { args: any[]; onError?: Effect; context?: any },
): ForkEffect<never> {
  const { args = [], onError, context } = options || {};
  const wrappedSaga = withFetchable({
    saga,
    onError,
    context,
    actionType,
  }) as any;
  return takeLatest(actionType.type, wrappedSaga, ...args);
}

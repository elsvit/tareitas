import { PayloadAction } from '@reduxjs/toolkit';

/**
 * Request actions are handled by sagas.
 * Store updates happen only via *Success actions after API sync (multidevice)
 * or directly in saga (device-only).
 */
export function noopEntityRequestReducer<
  TState,
  TAction extends PayloadAction<unknown>,
>(_state: TState, _action: TAction) {}

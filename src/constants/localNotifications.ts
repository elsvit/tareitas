/** Show local task reminders only if the child logged in on this device within this many days. */
export const SHOW_NOTIFICATION_IF_USER_WAS = 14;

/** Schedule reminders this many calendar days ahead (from today). */
export const LOCAL_NOTIFICATION_SCHEDULE_HORIZON_DAYS =
  SHOW_NOTIFICATION_IF_USER_WAS;

export const DEFAULT_NOTIFY_BEFORE_MINUTES = 15;

export const MIN_NOTIFY_BEFORE_MINUTES = 1;

/** Defer the first permission prompt so the child PIN session is stable. */
export const NOTIFICATION_PERMISSION_DEFER_MS = 2_000;

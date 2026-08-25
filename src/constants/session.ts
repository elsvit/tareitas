/** Must match server JWT_ACCESS_EXPIRES_IN (default 60m). */
export const SESSION_IDLE_MS = 60 * 60 * 1000;

export function isSessionIdleExpired(
  lastActivityAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!lastActivityAt) {
    return false;
  }

  const elapsed =
    now - new Date(lastActivityAt).getTime();

  return elapsed >= SESSION_IDLE_MS;
}

import { selectChildById, selectChildIds } from '~/store/children/selectors';
import { selectPendingOnboardingChildUserId } from '~/store/settings/selectors';
import type { IState } from '~/store/types';

/** Auto-generated username for the server placeholder child during multidevice signup. */
export function isPlaceholderOnboardingChildUsername(
  username: string | undefined,
): boolean {
  return !!username && /^ob[a-f0-9]{10}$/.test(username);
}

/**
 * True when multidevice signup should resume at the child profile step.
 * A stale pending flag (onboarding already finished) returns false.
 */
export function shouldResumeOnboardingChildProfile(
  getState: () => IState,
): boolean {
  const pendingChildUserId = selectPendingOnboardingChildUserId(getState());

  if (!pendingChildUserId) {
    return false;
  }

  const childIds = selectChildIds(getState());
  const child = selectChildById(getState(), pendingChildUserId);

  if (!child) {
    return childIds.length === 0;
  }

  return isPlaceholderOnboardingChildUsername(child.username);
}

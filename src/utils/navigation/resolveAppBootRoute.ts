import { ESyncMode } from '~/store/settings/enums';

/**
 * Resolves the initial route after app launch (cold start / reopen).
 *
 * - first launch (intro not completed) → intro onboarding slides
 * - syncMode null → setup ("Elige tu configuración")
 * - syncMode deviceOnly | multidevice + family loaded → Tasks (user unselected)
 * - syncMode set but family missing → setup
 */
export function resolveAppBootRoute(options: {
  syncMode: ESyncMode | null | undefined;
  hasFamily: boolean;
  onboardingIntroCompleted: boolean;
  resumeOnboardingChildProfile?: boolean;
}): '/(tabs)/Tasks' | '/(onboarding)' | '/(onboarding)?setup=1' {
  const {
    syncMode,
    hasFamily,
    onboardingIntroCompleted,
    resumeOnboardingChildProfile,
  } = options;

  const hasActiveMode =
    syncMode === ESyncMode.deviceOnly ||
    syncMode === ESyncMode.multidevice;

  if (resumeOnboardingChildProfile && hasFamily) {
    return '/(onboarding)?setup=1';
  }

  if (hasActiveMode && hasFamily) {
    return '/(tabs)/Tasks';
  }

  if (!onboardingIntroCompleted && !hasFamily && !hasActiveMode) {
    return '/(onboarding)';
  }

  return '/(onboarding)?setup=1';
}

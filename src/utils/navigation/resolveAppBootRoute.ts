import { ESyncMode } from '~/store/settings/enums';

/**
 * Resolves the initial route after app launch (cold start / reopen).
 *
 * - syncMode null → setup ("Elige tu configuración")
 * - syncMode deviceOnly | multidevice + family loaded → Tasks (user unselected)
 * - syncMode set but family missing → setup
 * - no syncMode and no family → intro onboarding
 */
export function resolveAppBootRoute(options: {
  syncMode: ESyncMode | null | undefined;
  hasFamily: boolean;
}): '/(tabs)/Tasks' | '/(onboarding)' | '/(onboarding)?setup=1' {
  const { syncMode, hasFamily } = options;

  const hasActiveMode =
    syncMode === ESyncMode.deviceOnly ||
    syncMode === ESyncMode.multidevice;

  if (!hasActiveMode) {
    return '/(onboarding)?setup=1';
  }

  if (hasFamily) {
    return '/(tabs)/Tasks';
  }

  return '/(onboarding)?setup=1';
}

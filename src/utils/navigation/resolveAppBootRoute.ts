/**
 * Resolves the initial route after app launch (cold start / reopen).
 *
 * 1. First install → intro onboarding (no family, not on setup screen).
 * 2. deviceOnly or multidevice with a saved family → Tasks (user may be unselected).
 * 3. Closed on "select your setup", or saved family is missing locally / on server
 *    → onboarding setup screen ("Elige tu configuración").
 */
export function resolveAppBootRoute(options: {
  hasFamily: boolean;
  requireLogin: boolean;
  pendingFamilySetup: boolean;
}): '/(tabs)/Tasks' | '/(onboarding)' | '/(onboarding)?setup=1' {
  const { hasFamily, requireLogin, pendingFamilySetup } = options;

  if (hasFamily) {
    return '/(tabs)/Tasks';
  }

  if (requireLogin || pendingFamilySetup) {
    return '/(onboarding)?setup=1';
  }

  return '/(onboarding)';
}

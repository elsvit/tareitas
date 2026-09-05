import Constants from 'expo-constants';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function resolveApiBaseUrl(): string {
  const fromPublicEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  const fromExtraStr =
    typeof fromExtra === 'string' ? fromExtra : undefined;

  if (__DEV__) {
    // Metro re-evaluates app.config.js on each start; prefer that over a stale
    // EXPO_PUBLIC_* literal baked into an older JS bundle or dev client build.
    return normalizeBaseUrl(
      fromExtraStr ?? fromPublicEnv ?? 'http://localhost:3000',
    );
  }

  return normalizeBaseUrl(
    fromPublicEnv ?? fromExtraStr ?? 'http://localhost:3000',
  );
}

export const API_CONFIG = {
  get baseUrl(): string {
    return resolveApiBaseUrl();
  },
};

if (__DEV__) {
  console.info(
    `[Tareitas] API base URL: ${API_CONFIG.baseUrl} (extra=${String(Constants.expoConfig?.extra?.apiUrl ?? 'unset')}, env=${String(process.env.EXPO_PUBLIC_API_URL ?? 'unset')})`,
  );
}

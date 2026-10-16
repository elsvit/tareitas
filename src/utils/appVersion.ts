import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function configBuildNumber(): string | null {
  const config = Constants.expoConfig;

  if (!config) {
    return null;
  }

  if (Platform.OS === 'android' && config.android?.versionCode != null) {
    return String(config.android.versionCode);
  }

  return config.ios?.buildNumber ?? null;
}

/** Installed app version and build, for example `1.0.2(57)`. */
export function getAppVersionLabel(): string {
  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    null;
  const build =
    Application.nativeBuildVersion ?? configBuildNumber();

  if (version && build) {
    return `${version}(${build})`;
  }

  return version ?? build ?? '';
}

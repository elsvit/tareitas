import Constants from 'expo-constants';

import type { Analytics } from '@react-native-firebase/analytics';

import {
  ANALYTICS_EVENTS,
  ANALYTICS_USER_PROPERTIES,
} from '~/constants/analytics';
import type { ImageStoreKind } from '~/store/images/types';
import { ESyncMode } from '~/store/settings/enums';

type FirebaseAnalyticsModule = typeof import('@react-native-firebase/analytics');

let cachedModule: FirebaseAnalyticsModule | null | undefined;
let cachedInstance: Analytics | null | undefined;

function getAnalyticsContext(): {
  mod: FirebaseAnalyticsModule;
  instance: Analytics;
} | null {
  if (cachedModule !== undefined) {
    if (!cachedModule || !cachedInstance) {
      return null;
    }

    return { mod: cachedModule, instance: cachedInstance };
  }

  // Production release builds only — skip dev, Expo Go, and local dev clients.
  if (__DEV__ || Constants.executionEnvironment === 'storeClient') {
    cachedModule = null;
    cachedInstance = null;
    return null;
  }

  try {
    const mod = require('@react-native-firebase/analytics') as FirebaseAnalyticsModule;
    cachedModule = mod;
    cachedInstance = mod.getAnalytics();

    return { mod, instance: cachedInstance };
  } catch {
    cachedModule = null;
    cachedInstance = null;
    return null;
  }
}

async function runAnalytics(
  action: (ctx: {
    mod: FirebaseAnalyticsModule;
    instance: Analytics;
  }) => Promise<void> | void,
): Promise<void> {
  const ctx = getAnalyticsContext();

  if (!ctx) {
    return;
  }

  try {
    await action(ctx);
  } catch {
    // Analytics must never break user actions.
  }
}

async function logAnalyticsEvent(
  name: string,
  params?: Record<string, string | number>,
): Promise<void> {
  await runAnalytics(({ mod, instance }) => {
    mod.logEvent(instance, name, params);
  });
}

async function setAnalyticsUserProperty(
  name: string,
  value: string,
): Promise<void> {
  await runAnalytics(({ mod, instance }) =>
    mod.setUserProperty(instance, name, value),
  );
}

export async function setAnalyticsLanguage(language: string): Promise<void> {
  await setAnalyticsUserProperty(ANALYTICS_USER_PROPERTIES.language, language);
}

export async function trackDeviceModeUsed(
  syncMode: ESyncMode,
): Promise<void> {
  const mode =
    syncMode === ESyncMode.deviceOnly ? 'only_device' : 'multi_device';

  await logAnalyticsEvent(ANALYTICS_EVENTS.device_mode_used, { mode });
}

export async function trackFamilySize(
  parentsCount: number,
  childrenCount: number,
): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.family_size, {
    parents_count: parentsCount,
    children_count: childrenCount,
  });
}

export async function trackFamiliesCount(count: number): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.families_count, { count });
}

export async function trackDefaultUserImageUsed(name: string): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.default_user_image_used, { name });
}

export async function trackDefaultTaskImageUsed(name: string): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.default_task_image_used, { name });
}

export async function trackDefaultRewardImageUsed(
  name: string,
): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.default_reward_image_used, {
    name,
  });
}

export function trackDefaultImageUsed(
  kind: ImageStoreKind,
  name: string,
): void {
  void logAnalyticsEvent(ANALYTICS_EVENTS.default_image_used, { kind, name });

  if (kind === 'user') {
    void trackDefaultUserImageUsed(name);
    return;
  }

  if (kind === 'task') {
    void trackDefaultTaskImageUsed(name);
    return;
  }

  void trackDefaultRewardImageUsed(name);
}

export async function trackDefaultBaseTaskUsed(options: {
  id: string;
  number_in_array: number;
}): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.default_base_task_used, options);
}

export async function trackDefaultRewardUsed(options: {
  id: string;
  number_in_array: number;
}): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.default_reward_used, options);
}

export async function trackTaskRecordUsed(): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.task_record_used);
}

export async function trackSubtaskRecordUsed(): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.subtask_record_used);
}

export async function trackSubtaskPhotoUsed(): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.subtask_photo_used);
}

export type HelpCenterEmailTopic =
  | 'tasks'
  | 'subtasks'
  | 'rewards'
  | 'family'
  | 'subscription'
  | 'account'
  | 'photos'
  | 'audio'
  | 'sync'
  | 'notifications'
  | 'other';

export async function trackHelpCenterOpened(): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.help_center_opened);
}

export async function trackHelpCenterEmailStarted(
  topic: HelpCenterEmailTopic = 'other',
): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.help_center_email_started, {
    topic,
  });
}

export async function trackLanguageScreenOpened(
  deviceLanguage: string,
): Promise<void> {
  await logAnalyticsEvent(ANALYTICS_EVENTS.language_screen_opened, {
    device_language: deviceLanguage,
  });
}

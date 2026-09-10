import Constants from 'expo-constants';

import type { Analytics } from '@react-native-firebase/analytics';

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

  if (Constants.executionEnvironment === 'storeClient') {
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
  await setAnalyticsUserProperty('language', language);
}

export async function trackDeviceModeUsed(
  syncMode: ESyncMode,
): Promise<void> {
  const mode =
    syncMode === ESyncMode.deviceOnly ? 'only_device' : 'multi_device';

  await logAnalyticsEvent('device_mode_used', { mode });
}

export async function trackFamilySize(
  parentsCount: number,
  childrenCount: number,
): Promise<void> {
  await logAnalyticsEvent('family_size', {
    parents_count: parentsCount,
    children_count: childrenCount,
  });
}

export async function trackFamiliesCount(count: number): Promise<void> {
  await logAnalyticsEvent('families_count', { count });
}

export async function trackDefaultUserImageUsed(): Promise<void> {
  await logAnalyticsEvent('default_user_image_used');
}

export async function trackDefaultTaskImageUsed(): Promise<void> {
  await logAnalyticsEvent('default_task_image_used');
}

export async function trackDefaultRewardImageUsed(): Promise<void> {
  await logAnalyticsEvent('default_reward_image_used');
}

export function trackDefaultImageUsed(kind: ImageStoreKind): void {
  if (kind === 'user') {
    void trackDefaultUserImageUsed();
    return;
  }

  if (kind === 'task') {
    void trackDefaultTaskImageUsed();
    return;
  }

  void trackDefaultRewardImageUsed();
}

export async function trackDefaultBaseTaskUsed(): Promise<void> {
  await logAnalyticsEvent('default_base_task_used');
}

export async function trackDefaultRewardUsed(): Promise<void> {
  await logAnalyticsEvent('default_reward_used');
}

export async function trackTaskRecordUsed(): Promise<void> {
  await logAnalyticsEvent('task_record_used');
}

export async function trackSubtaskRecordUsed(): Promise<void> {
  await logAnalyticsEvent('subtask_record_used');
}

export async function trackSubtaskPhotoUsed(): Promise<void> {
  await logAnalyticsEvent('subtask_photo_used');
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
  await logAnalyticsEvent('help_center_opened');
}

export async function trackHelpCenterEmailStarted(
  topic: HelpCenterEmailTopic = 'other',
): Promise<void> {
  await logAnalyticsEvent('help_center_email_started', { topic });
}

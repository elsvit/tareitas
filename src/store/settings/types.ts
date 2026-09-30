import { ELang } from '~/types/ELang';
import type { IIdDate } from '~/types/IIdDate';
import type { IFamilySubscription } from '~/types/ISubscription';
import { ERole, ESyncMode } from '~/store/settings/enums';

export interface IStateSettings {
  lang: ELang | null;
  /** True after the user picks a language in Settings; auto-detect does not set this. */
  langUserSelected?: boolean;
  isLangInitiating: boolean | null;
  isHabitsTabSeparated: boolean;
  isChildPasswordObligatory: boolean;
  isChildHasChangeFamily: boolean;
  showLoginName: boolean;
  showParentLoginName: boolean;
  currentUser: string | null;
  currentRole: ERole | null;
  taskCalendarDate: string;
  /** null = no active family mode → "Elige tu configuración". */
  syncMode: ESyncMode | null;
  familyId: string | null;
  subscription: IFamilySubscription | null;
  authToken: string | null;
  refreshToken: string | null;
  authUserId: string | null;
  authUserRole: ERole | null;
  lastSyncedTaskBaseRevision: number;
  lastSyncedRewardBaseRevision: number;
  catalogDirty: boolean;
  pendingRemovedTaskBaseIds: string[];
  pendingRemovedRewardBaseIds: string[];
  requireLogin: boolean;
  /** True while the user is on the family setup (sync mode) screen without a family yet. */
  pendingFamilySetup: boolean;
  lastSessionActivityAt: string | null;
  /** Set when app goes inactive/background (e.g. permission dialog). */
  lastAppBackgroundAt: string | null;
  pendingReturnRoute: PendingReturnRoute | null;
  sessionPauseCount: number;
  appInstalledAt: string | null;
  /** False on first launch until intro slides are finished; undefined = legacy user. */
  onboardingIntroCompleted?: boolean;
  /** Non-null while multidevice signup waits for the child profile step. */
  pendingOnboardingChildUserId?: string | null;
  /** Device-local login dates; never synced to the server. */
  thisDeviceUsers?: IIdDate[];
  /** Local child-task notification IDs already delivered on this device. */
  deliveredChildTaskLocalNotificationIds?: string[];
}

export type PendingReturnRoute = {
  pathname: string;
  params?: Record<string, string>;
};

export type SetLanguagePayload = {
  lang: ELang;
  userSelected?: boolean;
};

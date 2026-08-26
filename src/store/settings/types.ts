import { ELang } from '~/types/ELang';
import { ERole, ESyncMode } from '~/store/settings/enums';

export interface IStateSettings {
  lang: ELang | null;
  isLangInitiating: boolean | null;
  isHabitsTabSeparated: boolean;
  isChildPasswordObligatory: boolean;
  showLoginName: boolean;
  showParentLoginName: boolean;
  currentUser: string | null;
  currentRole: ERole | null;
  taskCalendarDate: string;
  syncMode: ESyncMode;
  familyId: string | null;
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
  lastSessionActivityAt: string | null;
  pendingReturnRoute: PendingReturnRoute | null;
  sessionPauseCount: number;
}

export type PendingReturnRoute = {
  pathname: string;
  params?: Record<string, string>;
};

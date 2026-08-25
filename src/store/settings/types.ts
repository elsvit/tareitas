import { ELang } from '~/types/ELang';
import { ERole, ESyncMode } from '~/store/settings/enums';

export interface IStateSettings {
  lang: ELang | null;
  isLangInitiating: boolean | null;
  isHabitsTabSeparated: boolean;
  isChildPasswordObligatory: boolean;
  currentUser: string | null;
  currentRole: ERole | null;
  taskCalendarDate: string;
  syncMode: ESyncMode;
  familyId: string | null;
  authToken: string | null;
  refreshToken: string | null;
  lastSyncedTaskBaseRevision: number;
  lastSyncedRewardBaseRevision: number;
  catalogDirty: boolean;
  pendingRemovedTaskBaseIds: string[];
  pendingRemovedRewardBaseIds: string[];
  requireLogin: boolean;
}

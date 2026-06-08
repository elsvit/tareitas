import { ELang } from '~/types/ELang';
import { ERole } from '~/store/settings/enums';

export interface IStateSettings {
  lang: ELang | null;
  isLangInitiating: boolean | null;
  isHabitsTabSeparated: boolean;
  currentUser: string | null; // Current user ID
  currentRole: ERole | null; // Current user role
}

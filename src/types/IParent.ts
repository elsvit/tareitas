import { ERole } from '~/store/settings/enums';

export interface IParent extends CreatedProps {
  id: string;
  name: string;
  familyRole?: string;
  role?: ERole;
  color?: string;
  avatar?: string;
  email?: string;
  username?: string;
  passwordPattern?: string;
}

export type ParentFormProps = OmitCreatedKeys<IParent>;

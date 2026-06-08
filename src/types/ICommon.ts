import { ERole } from '~/store/settings/enums';

export interface IId {
  id: string;
}

export interface IOptions<T> {
  label: string;
  value: T;
}

export interface IStringOptions extends IOptions<string> {}

export  interface IUserAvatar {
  role: ERole,
  id: string,
  name: string,
  avatar?: string;
}

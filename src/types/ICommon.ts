import { ImageSourcePropType } from 'react-native';
import { ERole } from '~/store/settings/enums';

export interface IId {
  id: string;
}

export interface IOptions<T> {
  label: string;
  value: T;
}

export interface IImageOption {
  label: string;
  value: string;
  image: ImageSourcePropType;
}

export interface IStringOptions extends IOptions<string> {}

export  interface IUserAvatar {
  role: ERole,
  id: string,
  name: string,
  avatar?: string;
  color?: string;
}

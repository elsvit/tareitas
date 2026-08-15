declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.gif';
declare module '*.webp';

type PrimitiveType = string | number | boolean;
type Maybe<T> = T | null | undefined;

type RecordType<T> = Record<string, Maybe<T>>;

type Persisted<T> = T & { _persist?: unknown };

// declare module 'react-native-config' {
//   getConstants: () => Record<string, string>;
//   // export const SUPABASE_URL: string;
//   // export const SUPABASE_ANON_KEY: string;
//   // export const SUPABASE_DISHES_IMAGES_BUCKET: string;
// }

// declare module 'remotedev' {
//   import { Store } from 'redux';

//   interface RemoteDevOptions {
//     name?: string;
//     realtime?: boolean;
//     hostname?: string;
//     port?: number;
//   }

//   function remotedev(store: Store, options?: RemoteDevOptions): Store;
//   export default remotedev;
// }

type CreatedProps = {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
};

type CreatedKeys =
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy';

type OmitCreatedKeys<T> = Omit<T, CreatedKeys>;

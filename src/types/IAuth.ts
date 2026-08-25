export interface IAuthUser {
  id: string;
  username: string | null;
  email: string | null;
  role: 'admin' | 'parent' | 'child';
  familyId: string | null;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  user: IAuthUser;
}

export interface IRegisterUserPayload {
  email?: string;
  username?: string;
  pin: string;
  lang?: string;
}

export interface ILoginPayload {
  email?: string;
  username?: string;
  pin: string;
  lang?: string;
}

export interface IFamilySummary {
  family: {
    id: string;
    name: string;
  };
}

export interface IFamilyParentMember {
  userId: string;
  name: string;
  color?: string;
  avatar?: string;
  role: 'admin' | 'parent' | 'child';
  familyRole?: string;
  isOwner?: boolean;
  email?: string;
  username?: string;
}

export interface IFamilyChildMember {
  userId: string;
  name: string;
  color?: string;
  avatar?: string;
  reward?: number;
  birthday?: string;
  username?: string;
}

export interface IFamilyDetails {
  id: string;
  name: string;
  parents: IFamilyParentMember[];
  children: IFamilyChildMember[];
}

export interface ISignupFamilyPayload {
  familyName: string;
  lang?: string;
  admin: {
    email: string;
    pin: string;
    name: string;
    color?: string;
    avatar?: string;
  };
  child: {
    username: string;
    pin: string;
    name: string;
    color?: string;
    avatar?: string;
  };
}

export interface ISignupFamilyResponse extends IAuthTokens {
  family: IFamilyDetails;
}

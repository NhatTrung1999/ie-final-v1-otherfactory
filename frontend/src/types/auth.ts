export interface IAuth {
  Id: string;
  Name: string;
  UserID: string;
  Factory: string;
  Role: string;
  Permission: string;
  Active: boolean;
  CreatedAt: string;
  CreatedDate: string;
  UpdatedAt: string;
  UpdatedDate: string;
}

export interface IAuthResponse {
  auth: IAuth;
  accessToken: string;
}

export interface IAuthState {
  auth: IAuth | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface ILoginPayload {
  username: string;
  password: string;
  factory: string;
  category?: string;
}

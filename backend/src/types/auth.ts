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

export interface IAuthPayload {
  username: string;
  password: string;
  factory: string;
}

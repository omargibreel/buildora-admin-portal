export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInMinutes: number;
  user: UserInfo;
}

export interface LoginRequest {
  email: string;
  password: string;
}

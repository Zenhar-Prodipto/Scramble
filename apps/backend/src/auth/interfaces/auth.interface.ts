export interface SignupResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    lastLogin: Date | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    lastLogin: Date | null;
  };
  accessToken: string;
  refreshToken: string;
}

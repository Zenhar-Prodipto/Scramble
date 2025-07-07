export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    message: string;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  status?: number;
}

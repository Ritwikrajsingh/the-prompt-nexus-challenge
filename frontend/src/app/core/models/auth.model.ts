export interface AuthRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  username: string;
  message: string;
}

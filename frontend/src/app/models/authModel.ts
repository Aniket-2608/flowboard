export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface RegisterRequest {
  name : string;
  email : string;
  password : string;
}
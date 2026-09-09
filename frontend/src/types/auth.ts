export interface User {
  id: number
  name: string
  email: string
  role: string
  enabled: boolean
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
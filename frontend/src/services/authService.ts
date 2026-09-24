import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth"

const API_URL = import.meta.env.VITE_API_URL

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  const result = (await response.json()) as ApiResponse<T>

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong")
  }

  return result.data
}

export async function login(
  credentials: LoginRequest,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function register(
  credentials: RegisterRequest,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function getCurrentUser(
  accessToken: string,
): Promise<User> {
  return request<User>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function logout(
  accessToken: string,
): Promise<void> {
  await request<void>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
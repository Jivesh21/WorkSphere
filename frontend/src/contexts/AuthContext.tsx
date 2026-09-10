import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/services/authService"

import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth"

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (credentials: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext =
  createContext<AuthContextValue | null>(null)

const TOKEN_KEY = "worksphere_access_token"

function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] =
    useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setIsLoading(false)
      return
    }

    setAccessToken(token)

    getCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setAccessToken(null)
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (
    credentials: LoginRequest,
  ) => {
    const response = await loginRequest(credentials)

    localStorage.setItem(
      TOKEN_KEY,
      response.accessToken,
    )

    setAccessToken(response.accessToken)
    setUser(response.user)
  }

  const register = async (
    credentials: RegisterRequest,
  ) => {
    const response = await registerRequest(credentials)

    localStorage.setItem(
      TOKEN_KEY,
      response.accessToken,
    )

    setAccessToken(response.accessToken)
    setUser(response.user)
  }

  const logout = async () => {
    if (accessToken) {
      try {
        await logoutRequest(accessToken)
      } catch {
        // Clear local authentication even if the request fails.
      }
    }

    localStorage.removeItem(TOKEN_KEY)
    setAccessToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, accessToken, isLoading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
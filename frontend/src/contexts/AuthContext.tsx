import {
  useCallback,
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
  isDevelopmentPreview: boolean
  avatarPreview: string | null
  updateNameLocally: (name: string) => void
  setAvatarPreview: (preview: string | null) => void
  startDevelopmentPreview: () => void
  login: (credentials: LoginRequest) => Promise<void>
  register: (credentials: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext =
  createContext<AuthContextValue | null>(null)

const TOKEN_KEY = "worksphere_access_token"
const PREVIEW_KEY = import.meta.env.DEV ? "worksphere_development_preview" : ""
const previewUser: User = {
  id: 0,
  name: "Demo User",
  email: "demo@localhost",
  role: "DEMO",
  enabled: true,
  createdAt: new Date(0).toISOString(),
}

function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] =
    useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isDevelopmentPreview, setIsDevelopmentPreview] = useState(
    () => import.meta.env.DEV && sessionStorage.getItem(PREVIEW_KEY) === "true",
  )

  const updateNameLocally = useCallback((name: string) => {
    setUser((current) => current ? { ...current, name } : current)
  }, [])

  useEffect(() => {
    if (isDevelopmentPreview) {
      setUser(previewUser)
      setIsLoading(false)
      return
    }

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
  }, [isDevelopmentPreview])

  const startDevelopmentPreview = useCallback(() => {
    if (!import.meta.env.DEV) return
    sessionStorage.setItem(PREVIEW_KEY, "true")
    setUser(previewUser)
    setAccessToken(null)
    setAvatarPreview(null)
    setIsDevelopmentPreview(true)
  }, [])

  const login = async (
    credentials: LoginRequest,
  ) => {
    const response = await loginRequest(credentials)

    localStorage.setItem(
      TOKEN_KEY,
      response.accessToken,
    )

    if (import.meta.env.DEV) sessionStorage.removeItem(PREVIEW_KEY)
    setIsDevelopmentPreview(false)
    setAccessToken(response.accessToken)
    setUser(response.user)
    setAvatarPreview(null)
  }

  const register = async (
    credentials: RegisterRequest,
  ) => {
    await registerRequest(credentials)
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
    if (import.meta.env.DEV) sessionStorage.removeItem(PREVIEW_KEY)
    setAccessToken(null)
    setUser(null)
    setAvatarPreview(null)
    setIsDevelopmentPreview(false)
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && (accessToken || isDevelopmentPreview)),
      isLoading,
      isDevelopmentPreview,
      avatarPreview,
      updateNameLocally,
      setAvatarPreview,
      startDevelopmentPreview,
      login,
      register,
      logout,
    }),
    [user, accessToken, isLoading, isDevelopmentPreview, avatarPreview, updateNameLocally, startDevelopmentPreview],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

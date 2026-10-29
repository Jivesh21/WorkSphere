import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { ThemeContext, type ResolvedTheme, type Theme } from "@/contexts/theme"

const STORAGE_KEY = "worksphere-theme"

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (
      stored === "light" ||
      stored === "dark" ||
      stored === "system" ||
      stored === "ocean" ||
      stored === "forest" ||
      stored === "lavender" ||
      stored === "midnight"
    ) {
      return stored
    }
  } catch {
    // Storage may be unavailable; the app can still use its default theme.
  }
  return "midnight"
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme)

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Keep theme changes available for this session if storage is unavailable.
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light")
    media.addEventListener("change", updateSystemTheme)
    return () => media.removeEventListener("change", updateSystemTheme)
  }, [])

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark" || resolvedTheme === "midnight")
  }, [resolvedTheme])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

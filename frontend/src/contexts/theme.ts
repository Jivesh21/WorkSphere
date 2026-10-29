import { createContext } from "react"

export type Theme =
  | "light"
  | "dark"
  | "system"
  | "ocean"
  | "forest"
  | "lavender"
  | "midnight"

export type ResolvedTheme = Exclude<Theme, "system">

export interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

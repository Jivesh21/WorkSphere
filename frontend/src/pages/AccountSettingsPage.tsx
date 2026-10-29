import { useState } from "react"
import { Check, Laptop, LogOut, Moon, Palette, Sun, Trees, Waves, Flower2, Sparkles, LockKeyhole, Mail } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import type { Theme } from "@/contexts/theme"
import useTheme from "@/hooks/useTheme"

const options: { value: Theme; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", description: "Clean and bright", icon: Sun },
  { value: "dark", label: "Dark", description: "Easy on the eyes", icon: Moon },
  { value: "system", label: "System", description: "Follow device settings", icon: Laptop },
  { value: "ocean", label: "Ocean", description: "Cool blue tones", icon: Waves },
  { value: "forest", label: "Forest", description: "Natural green tones", icon: Trees },
  { value: "lavender", label: "Lavender", description: "Soft purple tones", icon: Flower2 },
  { value: "midnight", label: "Midnight", description: "Deep indigo dark", icon: Sparkles },
]

function AccountSettingsPage() {
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try { await logout() } finally { navigate("/login", { replace: true }) }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-border pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Your account</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Appearance and account controls available in this workspace.</p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
            <span className="flex size-8 items-center justify-center rounded-md bg-muted"><Palette className="size-4" /></span>
            <div><h2 className="text-sm font-semibold">Appearance</h2><p className="mt-0.5 text-xs text-muted-foreground">Your theme is saved in this browser.</p></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map(({ value, label, description, icon: Icon }) => {
              const selected = theme === value
              return <button key={value} type="button" aria-pressed={selected} onClick={() => setTheme(value)} className={`flex min-h-14 items-center gap-3 rounded-md border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary/50 bg-accent" : "border-border hover:bg-muted"}`}>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span>
                {selected && <Check className="size-4 text-primary" aria-label="Selected" />}
              </button>
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 border-b border-border pb-4"><h2 className="text-sm font-semibold">Account and security</h2><p className="mt-0.5 text-xs text-muted-foreground">Manage your profile and current sign-in session.</p></div>
          <div className="divide-y divide-border">
            <div className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Mail className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Email address</p><p className="mt-0.5 text-xs text-muted-foreground">Changing email requires verification, which is not available yet.</p></div></div><Link to="/profile" className="inline-flex h-8 w-fit items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">View profile</Link></div>
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Password</p><p className="mt-0.5 text-xs text-muted-foreground">Password changes are not supported by the current account API.</p></div></div></div>
            <div className="flex flex-col gap-3 py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><LogOut className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Sign out</p><p className="mt-0.5 text-xs text-muted-foreground">End this session on this device.</p></div></div><Button variant="outline" size="sm" disabled={loggingOut} onClick={handleLogout}>{loggingOut ? "Signing out…" : "Sign out"}</Button></div>
          </div>
        </section>
        <p className="text-xs leading-relaxed text-muted-foreground">Account preferences beyond theme, password changes, and email verification need backend support. Theme selection is stored locally in this browser.</p>
      </div>
    </DashboardLayout>
  )
}

export default AccountSettingsPage

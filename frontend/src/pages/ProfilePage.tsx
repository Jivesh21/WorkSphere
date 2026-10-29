import { useRef, useState, type FormEvent } from "react"
import { CalendarDays, Camera, Check, CircleUserRound, Mail, ShieldCheck, UserRound } from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useAuth from "@/hooks/useAuth"

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
}

function ProfilePage() {
  const { user, avatarPreview, setAvatarPreview, updateNameLocally } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = name.trim()
    if (!value) { setError("Enter your name."); setSaved(false); return }
    if (value.length > 100) { setError("Name must be 100 characters or fewer."); setSaved(false); return }
    setError("")
    updateNameLocally(value)
    setName(value)
    setSaved(true)
  }

  function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPG, PNG, or WebP image.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be 2 MB or smaller.")
      return
    }
    setAvatarError("")
    setAvatarLoading(true)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarPreview(reader.result)
      else setAvatarError("This image could not be previewed.")
      setAvatarLoading(false)
    }
    reader.onerror = () => { setAvatarError("This image could not be read."); setAvatarLoading(false) }
    reader.readAsDataURL(file)
  }

  const createdLabel = user?.createdAt && !Number.isNaN(Date.parse(user.createdAt))
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(user.createdAt))
    : "Not available"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-border pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Your account</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Manage the personal details shown in your workspace.</p>
        </header>

        {!user ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">Account information is unavailable in this session.</div>
        ) : <>
          <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center">
            <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xl font-semibold text-muted-foreground" aria-label={`${user.name} avatar`}>
              {avatarPreview ? <img src={avatarPreview} alt="Session avatar preview" className="size-full object-cover" /> : initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold">{user.name}</h2>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">Avatar preview is local to this session. WorkSphere does not have an avatar upload service yet.</p>
              {avatarError && <p role="alert" className="mt-2 text-xs text-destructive">{avatarError}</p>}
            </div>
            <div className="shrink-0">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Choose avatar image" onChange={handleAvatar} />
              <Button type="button" variant="outline" disabled={avatarLoading} onClick={() => fileRef.current?.click()} className="gap-2">
                <Camera className="size-4" />{avatarLoading ? "Preparing…" : "Choose photo"}
              </Button>
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">JPG, PNG or WebP · 2 MB max</p>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
                <UserRound className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Personal information</h2>
              </div>
              <form onSubmit={handleSave} noValidate className="space-y-4">
                <div>
                  <label htmlFor="profile-name" className="mb-1.5 block text-xs font-medium">Full name</label>
                  <Input id="profile-name" value={name} maxLength={100} onChange={(event) => { setName(event.target.value); setSaved(false); if (error) setError("") }} aria-invalid={Boolean(error)} aria-describedby={error ? "profile-name-error" : undefined} />
                  {error && <p id="profile-name-error" role="alert" className="mt-1.5 text-xs text-destructive">{error}</p>}
                </div>
                <div>
                  <label htmlFor="profile-email" className="mb-1.5 block text-xs font-medium">Email address</label>
                  <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="profile-email" value={user.email} readOnly className="pl-9" /></div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Email changes require a verification flow that is not currently available.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => { setName(user.name); setError(""); setSaved(false) }}>Cancel</Button>
                  <Button type="submit" disabled={name.trim() === user.name}>Save changes</Button>
                  {saved && <span role="status" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="size-3.5" />Updated for this session</span>}
                </div>
              </form>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">Profile editing is a local prototype. The name change updates this app session and resets when you reload; no profile update API is available.</p>
            </section>

            <section className="rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
                <CircleUserRound className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Account details</h2>
              </div>
              <dl className="space-y-4">
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Workspace role</dt><dd className="mt-0.5 text-sm font-medium">{user.role}</dd></div></div>
                <div className="flex items-start gap-3"><Check className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Account status</dt><dd className="mt-0.5 text-sm font-medium">{user.enabled ? "Active" : "Disabled"}</dd></div></div>
                <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Member since</dt><dd className="mt-0.5 text-sm font-medium">{createdLabel}</dd></div></div>
              </dl>
            </section>
          </div>
        </>}
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage

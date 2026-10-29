import { useEffect, useRef, useState } from "react"
import {
  ChevronRight,
  Menu,
  Laptop,
  Moon,
  Palette,
  Plus,
  Search,
  X,
  Sun,
  Trees,
  Waves,
  Flower2,
  Sparkles,
  FolderKanban,
  CircleDot,
  ListTodo,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import { Button } from "@/components/ui/button"
import type { Theme } from "@/contexts/theme"
import useTheme from "@/hooks/useTheme"
import { mobileNavigation } from "@/components/layout/navigation"
import useAuth from "@/hooks/useAuth"
import useIssues from "@/hooks/useIssues"
import useProjects from "@/hooks/useProjects"
import useTasks from "@/hooks/useTasks"
import NotificationCenter from "@/components/layout/NotificationCenter"
import { taskStatusLabels } from "@/pages/MyWorkPage/types"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/work": "My Work",
  "/projects": "Projects",
  "/teams": "Teams",
  "/issues": "Issues",
  "/board": "Board",
  "/profile": "Profile",
  "/settings": "Settings",
}

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
}

const themeOptions: {
  value: Theme
  label: string
  description: string
  icon: typeof Sun
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Clean and bright",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow device settings",
    icon: Laptop,
  },
  {
    value: "ocean",
    label: "Ocean",
    description: "Cool blue tones",
    icon: Waves,
  },
  {
    value: "forest",
    label: "Forest",
    description: "Natural green tones",
    icon: Trees,
  },
  {
    value: "lavender",
    label: "Lavender",
    description: "Soft purple tones",
    icon: Flower2,
  },
  {
    value: "midnight",
    label: "Midnight",
    description: "Deep indigo dark",
    icon: Sparkles,
  },
]

function TopNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const createMenuRef = useRef<HTMLDivElement>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const mobileNavRef = useRef<HTMLDivElement>(null)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState("")
  const globalSearchRef = useRef<HTMLDivElement>(null)
  const globalSearchTriggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const { issues } = useIssues()
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const { user, avatarPreview, logout } = useAuth()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark" || resolvedTheme === "midnight"

  const currentPage = pageTitles[location.pathname] ?? "Dashboard"

  useEffect(() => {
    if (globalSearchOpen && window.matchMedia("(min-width: 640px)").matches) {
      searchInputRef.current?.focus()
    }
  }, [globalSearchOpen])

  useEffect(() => {
    if (!createMenuOpen && !mobileNavOpen && !globalSearchOpen && !accountMenuOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (globalSearchOpen) {
          if (window.matchMedia("(min-width: 640px)").matches) searchInputRef.current?.focus()
          else globalSearchTriggerRef.current?.focus()
        }
        else if (mobileNavOpen) mobileNavRef.current?.querySelector("button")?.focus()
        else if (createMenuOpen) createMenuRef.current?.querySelector("button")?.focus()
        setCreateMenuOpen(false)
        setMobileNavOpen(false)
        setGlobalSearchOpen(false)
        setAccountMenuOpen(false)
      }
    }
    function handleOutsideClick(event: MouseEvent) {
      if (!(event.target instanceof Node)) return
      if (!createMenuRef.current?.contains(event.target)) setCreateMenuOpen(false)
      if (!mobileNavRef.current?.contains(event.target)) setMobileNavOpen(false)
      if (!globalSearchRef.current?.contains(event.target)) setGlobalSearchOpen(false)
      if (!accountMenuRef.current?.contains(event.target)) setAccountMenuOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    window.addEventListener("mousedown", handleOutsideClick)
    return () => {
      window.removeEventListener("keydown", handleEscape)
      window.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [createMenuOpen, mobileNavOpen, globalSearchOpen, accountMenuOpen])
  const createOptions = [
    { label: "Project", description: "Start a workspace for related work", path: "/projects", kind: "project", icon: FolderKanban },
    { label: "Issue", description: "Record a bug, blocker, or request", path: "/issues", kind: "issue", icon: CircleDot },
    { label: "Task", description: "Add a task to My Work", path: "/work", kind: "task", icon: ListTodo },
  ] as const

  function openCreateFlow(option: (typeof createOptions)[number]) {
    setCreateMenuOpen(false)
    navigate(option.path, { state: { quickCreate: option.kind } })
  }

  const normalizedGlobalSearch = globalSearch.trim().toLocaleLowerCase()
  const globalSearchResults = normalizedGlobalSearch
    ? [
        ...issues.filter((issue) => [issue.key, issue.title, issue.project, issue.assignee].some((value) => value.toLocaleLowerCase().includes(normalizedGlobalSearch)))
          .map((issue) => ({ id: `issue-${issue.id}`, kind: "Issue", title: issue.title, detail: `${issue.key} · ${issue.project}`, open: () => openIssueResult(issue.id) })),
        ...tasks.filter((task) => [task.title, task.description, task.projectName ?? "", task.assignedUserName ?? ""].some((value) => value.toLocaleLowerCase().includes(normalizedGlobalSearch)))
          .map((task) => ({ id: `task-${task.id}`, kind: "Task", title: task.title, detail: [task.projectName, taskStatusLabels[task.status]].filter(Boolean).join(" · "), open: () => { setGlobalSearchOpen(false); navigate("/work") } })),
        ...projects.filter((project) => [project.name, project.code, project.description].some((value) => value.toLocaleLowerCase().includes(normalizedGlobalSearch)))
          .map((project) => ({ id: `project-${project.id}`, kind: "Project", title: project.name, detail: `${project.code} · ${project.status}`, open: () => { setGlobalSearchOpen(false); navigate("/projects") } })),
      ].slice(0, 8)
    : []

  function openIssueResult(issueId: number) {
    setGlobalSearchOpen(false)
    setGlobalSearch("")
    navigate("/issues", { state: { openIssue: issueId } })
  }

  async function handleLogout() {
    setAccountMenuOpen(false)
    await logout()
    navigate("/login", { replace: true })
  }

  const toggleLightDark = () => {
    setTheme(isDarkTheme ? "light" : "dark")
  }

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-3 transition-colors sm:px-4">
      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <div className="relative lg:hidden" ref={mobileNavRef}>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" onClick={() => setMobileNavOpen((open) => !open)}>
            {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <AnimatePresence>
            {mobileNavOpen && (
              <m.nav id="mobile-navigation" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.16 }} aria-label="Primary navigation" className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
                {mobileNavigation.map(({ label, href, icon: Icon }) => {
                  const active = location.pathname === href
                  return (
                    <Link key={href} to={href} onClick={() => setMobileNavOpen(false)} aria-current={active ? "page" : undefined} className={`flex h-9 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-accent text-accent-foreground" : "text-foreground"}`}>
                      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />{label}
                    </Link>
                  )
                })}
              </m.nav>
            )}
          </AnimatePresence>
        </div>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">
          WorkSphere Workspace
        </span>

        <ChevronRight className="hidden size-4 text-muted-foreground/50 sm:block" />

        <span className="truncate text-xs font-medium text-foreground">
          {currentPage}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="relative lg:absolute lg:left-4 lg:right-[296px] lg:top-1/2 lg:-translate-y-1/2" ref={globalSearchRef}>
          <div className="relative hidden w-[min(32vw,360px)] lg:block lg:w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="global-workspace-search"
              type="search"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              onFocus={() => setGlobalSearchOpen(true)}
              placeholder="Search tasks, projects, issues..."
              aria-label="Search tasks, projects, and issues"
              aria-expanded={globalSearchOpen}
              aria-controls="global-issue-search"
              className="h-9 w-full rounded-md border border-input bg-card/70 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <Button ref={globalSearchTriggerRef} type="button" variant="ghost" size="icon-sm" aria-label="Search tasks, projects, and issues" aria-expanded={globalSearchOpen} aria-controls="global-issue-search" onClick={() => setGlobalSearchOpen((open) => !open)} className="lg:hidden">
            <Search className="size-4" aria-hidden="true" />
          </Button>
          <AnimatePresence>
            {globalSearchOpen && (
              <m.div id="global-issue-search" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.16 }} className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-1.5rem))] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl">
                {normalizedGlobalSearch ? (
                  globalSearchResults.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto" aria-label="Workspace search results">
                      {globalSearchResults.map((result) => (
                        <button key={result.id} type="button" onClick={result.open} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                          <span className="w-12 shrink-0 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{result.kind}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{result.title}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{result.detail}</span></span>
                        </button>
                      ))}
                    </div>
                  ) : <p className="px-2.5 py-3 text-xs text-muted-foreground">No tasks, projects, or issues match “{globalSearch.trim()}”.</p>
                ) : <p className="px-2.5 py-2 text-[10px] text-muted-foreground">Search data available in this session.</p>}
              </m.div>
            )}
          </AnimatePresence>
        </div>
        <NotificationCenter />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleLightDark}
          aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
          title={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
        >
          {isDarkTheme ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <div className="group relative">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Choose theme"
            title="Choose theme"
          >
            <Palette className="size-4" />
          </Button>

          <div className="invisible absolute right-0 top-full z-50 mt-2 w-64 translate-y-1 rounded-xl border border-border bg-popover p-2 text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="px-2 pb-2 pt-1">
              <p className="text-sm font-semibold">Appearance</p>
              <p className="text-xs text-muted-foreground">
                Personalize your workspace
              </p>
            </div>

            <div className="space-y-1">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const selected = theme === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      selected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <Icon className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>

                    {selected && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative" ref={createMenuRef}>
          <Button type="button" size="sm" aria-label="Create a project, issue, or task" aria-expanded={createMenuOpen} aria-controls="global-create-menu" onClick={() => setCreateMenuOpen((open) => !open)} className="h-8 gap-1.5 px-3 text-xs">
            <Plus className="size-3" />
            <span>Create</span>
          </Button>
          <AnimatePresence>
            {createMenuOpen && (
              <m.div id="global-create-menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.16 }} aria-label="Create new" className="absolute right-0 top-full z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
                {createOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button key={option.kind} type="button" onClick={() => openCreateFlow(option)} className="flex min-h-14 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary"><Icon className="size-4" aria-hidden="true" /></span>
                      <span className="min-w-0"><span className="block text-sm font-medium">{option.label}</span><span className="block text-xs text-muted-foreground">{option.description}</span></span>
                    </button>
                  )
                })}
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={accountMenuRef}>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Account menu" aria-expanded={accountMenuOpen} aria-controls="account-menu" onClick={() => setAccountMenuOpen((open) => !open)} className="overflow-hidden rounded-full border border-border">
            {avatarPreview ? <img src={avatarPreview} alt="" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center bg-muted text-[11px] font-semibold">{user?.name ? initials(user.name) : <UserRound className="size-4" />}</span>}
          </Button>
          <AnimatePresence>
            {accountMenuOpen && (
              <m.div id="account-menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.16 }} className="absolute right-0 top-full z-50 mt-2 w-[min(17rem,calc(100vw-1.5rem))] rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
                <div className="border-b border-border px-2.5 py-2"><p className="truncate text-sm font-medium">{user?.name ?? "Account"}</p><p className="truncate text-xs text-muted-foreground">{user?.email ?? "Account details unavailable"}</p></div>
                <Link to="/profile" onClick={() => setAccountMenuOpen(false)} className="mt-1 flex h-9 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><UserRound className="size-4 text-muted-foreground" />Profile</Link>
                <Link to="/settings" onClick={() => setAccountMenuOpen(false)} className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Settings className="size-4 text-muted-foreground" />Account settings</Link>
                <button type="button" onClick={handleLogout} className="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><LogOut className="size-4 text-muted-foreground" />Sign out</button>
              </m.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  )
}

export default TopNavbar

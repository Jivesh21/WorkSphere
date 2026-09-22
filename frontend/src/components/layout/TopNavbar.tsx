import {
  Bell,
  ChevronRight,
  CircleHelp,
  Plus,
  Search,
} from "lucide-react"
import { useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/work": "My Work",
  "/projects": "Projects",
  "/teams": "Teams",
  "/issues": "Issues",
  "/sprints": "Sprints",
  "/notifications": "Notifications",
  "/analytics": "Analytics",
  "/settings": "Settings",
}

function TopNavbar() {
  const location = useLocation()

  const currentPage =
    pageTitles[location.pathname] ?? "Dashboard"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-5 md:px-6">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden truncate text-sm text-muted-foreground sm:block">
          WorkSphere Workspace
        </span>

        <ChevronRight className="hidden size-4 text-muted-foreground/50 sm:block" />

        <span className="truncate text-sm font-medium">
          {currentPage}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          type="button"
          className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-sm text-muted-foreground transition hover:bg-muted/60 lg:flex"
        >
          <Search className="size-4" />

          <span className="flex-1 text-left">
            Search anything...
          </span>

          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
            ⌘ K
          </kbd>
        </button>

        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* Create */}
        <Button className="hidden gap-2 sm:flex">
          <Plus className="size-4" />
          Create
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-4" />

          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="Help"
        >
          <CircleHelp className="size-4" />
        </Button>

        {/* User */}
        <button
          type="button"
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background transition hover:opacity-90"
          aria-label="Open profile menu"
        >
          JS
        </button>
      </div>
    </header>
  )
}

export default TopNavbar
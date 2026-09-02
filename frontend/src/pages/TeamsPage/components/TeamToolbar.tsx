import { ChevronDown, Search } from "lucide-react"
import type { RoleFilter } from "../types"

interface TeamToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: RoleFilter
  roleFilters: RoleFilter[]
  showRoleMenu: boolean
  onToggleRoleMenu: () => void
  onRoleChange: (role: RoleFilter) => void
}

function TeamToolbar({
  search,
  onSearchChange,
  roleFilter,
  roleFilters,
  showRoleMenu,
  onToggleRoleMenu,
  onRoleChange,
}: TeamToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search team members..."
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-ring"
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={onToggleRoleMenu}
          className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <span>Role: {roleFilter}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 z-20 mt-2 min-w-36 rounded-xl border border-border bg-card p-1 shadow-lg">
            {roleFilters.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onRoleChange(role)}
                className="flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                {role}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamToolbar
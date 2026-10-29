import { Search } from "lucide-react"
import type { RoleFilter } from "../types"

interface TeamToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: RoleFilter
  roleFilters: RoleFilter[]
  onRoleChange: (role: RoleFilter) => void
}

function TeamToolbar({
  search,
  onSearchChange,
  roleFilter,
  roleFilters,
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

      <div>
        <label htmlFor="team-role-filter" className="sr-only">Filter team members by role</label>
        <select id="team-role-filter" value={roleFilter} onChange={(event) => onRoleChange(event.target.value as RoleFilter)} className="h-9 rounded-md border border-input bg-background px-2.5 text-xs outline-none transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
          {roleFilters.map((role) => <option key={role} value={role}>{role === "All" ? "All roles" : role}</option>)}
        </select>
      </div>
    </div>
  )
}

export default TeamToolbar

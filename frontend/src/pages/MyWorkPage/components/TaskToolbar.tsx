import { Check, ChevronDown, ListFilter, Search, X } from "lucide-react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import { dropdownMotion } from "@/lib/motion"
import { priorityFilters, sortOptions } from "../constants"
import { taskPriorityLabels, type PriorityFilter, type SortOption } from "../types"

interface TaskToolbarProps {
  search: string
  priorityFilter: PriorityFilter
  overdueOnly: boolean
  sortOption: SortOption
  showFilters: boolean
  showSort: boolean
  groupByStatus: boolean
  resultCount: number
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onPriorityChange: (value: PriorityFilter) => void
  onToggleOverdue: () => void
  onSortChange: (value: SortOption) => void
  onToggleFilters: () => void
  onToggleSort: () => void
  onToggleGroup: () => void
  onClearFilters: () => void
}

function TaskToolbar({
  search,
  priorityFilter,
  overdueOnly,
  sortOption,
  showFilters,
  showSort,
  groupByStatus,
  resultCount,
  hasActiveFilters,
  onSearchChange,
  onPriorityChange,
  onToggleOverdue,
  onSortChange,
  onToggleFilters,
  onToggleSort,
  onToggleGroup,
  onClearFilters,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-[360px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          aria-label="Search your tasks"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto text-xs tabular-nums text-muted-foreground">{resultCount} {resultCount === 1 ? "task" : "tasks"}</span>
        <div className="relative">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={showFilters}
            aria-haspopup="true"
            className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${priorityFilter !== "All" || overdueOnly ? "border-primary/40 bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <ListFilter className="size-3.5" aria-hidden="true" />
            Filters
            {(priorityFilter !== "All" || overdueOnly) && <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">{Number(priorityFilter !== "All") + Number(overdueOnly)}</span>}
          </button>
          <AnimatePresence>
            {showFilters && (
              <m.div {...dropdownMotion} className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
                <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</p>
                {priorityFilters.map((priority) => (
                  <button key={priority} type="button" onClick={() => onPriorityChange(priority)} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring ${priorityFilter === priority ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    {priority === "All" ? "All priorities" : taskPriorityLabels[priority]}
                    {priorityFilter === priority && <Check className="size-3.5" aria-hidden="true" />}
                  </button>
                ))}
                <div className="my-1 border-t border-border" />
                <button type="button" aria-pressed={overdueOnly} onClick={onToggleOverdue} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring ${overdueOnly ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  Overdue tasks
                  {overdueOnly && <Check className="size-3.5" aria-hidden="true" />}
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
        <button type="button" aria-pressed={groupByStatus} onClick={onToggleGroup} className={`inline-flex h-9 items-center rounded-md border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${groupByStatus ? "border-primary/40 bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>Group</button>
        {hasActiveFilters && <button type="button" onClick={onClearFilters} className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><X className="size-3.5" aria-hidden="true" />Clear</button>}

        <div className="relative">
          <button type="button" onClick={onToggleSort} aria-expanded={showSort} aria-haspopup="true" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            Sort <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {showSort && (
              <m.div {...dropdownMotion} className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
                <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sort by</p>
                {sortOptions.map((option) => (
                  <button key={option} type="button" onClick={() => onSortChange(option)} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring ${sortOption === option ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    {option}
                    {sortOption === option && <Check className="size-3.5" aria-hidden="true" />}
                  </button>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default TaskToolbar

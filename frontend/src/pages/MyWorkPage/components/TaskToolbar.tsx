import {
  Check,
  ChevronDown,
  ListFilter,
  Search,
} from "lucide-react"

import type {
  PriorityFilter,
  SortOption,
} from "../types"

interface TaskToolbarProps {
  search: string
  priorityFilter: PriorityFilter
  sortOption: SortOption
  showFilters: boolean
  showSort: boolean
  onSearchChange: (value: string) => void
  onPriorityChange: (value: PriorityFilter) => void
  onSortChange: (value: SortOption) => void
  onToggleFilters: () => void
  onToggleSort: () => void
}

const priorityFilters: PriorityFilter[] = [
  "All",
  "High",
  "Medium",
  "Low",
]

const sortOptions: SortOption[] = [
  "Due date",
  "Priority",
  "Title",
]

function TaskToolbar({
  search,
  priorityFilter,
  sortOption,
  showFilters,
  showSort,
  onSearchChange,
  onPriorityChange,
  onSortChange,
  onToggleFilters,
  onToggleSort,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-[360px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search your tasks..."
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={onToggleFilters}
            className={[
              "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
              priorityFilter !== "All"
                ? "border-foreground/30 bg-muted text-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            <ListFilter className="size-3.5" />

            Filters

            {priorityFilter !== "All" && (
              <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[9px] text-background">
                1
              </span>
            )}
          </button>

          {showFilters && (
            <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl">
              <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </p>

              {priorityFilters.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() =>
                    onPriorityChange(priority)
                  }
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition",
                    priorityFilter === priority
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {priority}

                  {priorityFilter === priority && (
                    <Check className="size-3.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Sort
            <ChevronDown className="size-3.5" />
          </button>

          {showSort && (
            <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl">
              <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sort by
              </p>

              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSortChange(option)}
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition",
                    sortOption === option
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {option}

                  {sortOption === option && (
                    <Check className="size-3.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskToolbar
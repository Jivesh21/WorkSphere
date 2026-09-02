

import DashboardLayout from "@/components/layout/DashboardLayout"

import {
  statusFilters,
} from "./constants"
import EmptyState from "./components/EmptyState"
import SummaryCard from "./components/SummaryCard"
import TaskGroup from "./components/TaskGroup"
import TaskToolbar from "./components/TaskToolbar"
import useMyWork from "./hooks/useMyWork"

function MyWorkPage() {
  const {
    visibleTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    summary,
    filters,
    actions,
  } = useMyWork()

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Personal workspace
            </p>

            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
              My Work
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Stay on top of your tasks, priorities, and deadlines.
            </p>
          </div>

          
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            label="Total tasks"
            value={String(summary.total)}
            description="assigned to you"
          />

          <SummaryCard
            label="In progress"
            value={String(summary.inProgress)}
            description="currently active"
          />

          <SummaryCard
            label="Due today"
            value={String(summary.dueToday)}
            description="need attention"
          />

          <SummaryCard
            label="Completed"
            value={String(summary.completed)}
            description="completed tasks"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <TaskToolbar
            search={filters.search}
            priorityFilter={filters.priorityFilter}
            sortOption={filters.sortOption}
            showFilters={filters.showFilters}
            showSort={filters.showSort}
            onSearchChange={actions.setSearch}
            onPriorityChange={(value) => {
              actions.setPriorityFilter(value)
              actions.setShowFilters(false)
            }}
            onSortChange={(value) => {
              actions.setSortOption(value)
              actions.setShowSort(false)
            }}
            onToggleFilters={() =>
              actions.setShowFilters(
                !filters.showFilters,
              )
            }
            onToggleSort={() =>
              actions.setShowSort(
                !filters.showSort,
              )
            }
          />

          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max items-center gap-1 px-4">
              {statusFilters.map((status) => {
                const isActive =
                  filters.activeStatus === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      actions.setActiveStatus(status)
                    }
                    className={[
                      "relative px-3 py-3 text-xs font-medium transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {status}

                    {isActive && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <TaskGroup
              title="Today"
              tasks={todayTasks}
              onToggleTask={actions.handleToggleTask}
            />

            <TaskGroup
              title="Upcoming"
              tasks={upcomingTasks}
              onToggleTask={actions.handleToggleTask}
            />

            <TaskGroup
              title="Completed"
              tasks={completedTasks}
              onToggleTask={actions.handleToggleTask}
            />

            {visibleTasks.length === 0 && (
              <EmptyState
                search={filters.search}
                activeStatus={filters.activeStatus}
              />
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default MyWorkPage
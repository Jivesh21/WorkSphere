import { useMemo, useState } from "react"
import {
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"

import DashboardLayout from "@/components/layout/DashboardLayout"

type TaskStatus = "To do" | "In progress" | "Done"
type TaskPriority = "High" | "Medium" | "Low"
type PriorityFilter = "All" | TaskPriority
type SortOption = "Due date" | "Priority" | "Title"

interface Task {
  id: number
  title: string
  project: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  dueLabel: string
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Fix authentication refresh flow",
    project: "WorkSphere",
    status: "In progress",
    priority: "High",
    dueDate: "Aug 27",
    dueLabel: "Today",
  },
  {
    id: 2,
    title: "Review project API endpoints",
    project: "Nimbus API",
    status: "To do",
    priority: "High",
    dueDate: "Aug 27",
    dueLabel: "Today",
  },
  {
    id: 3,
    title: "Update dashboard responsive layout",
    project: "WorkSphere",
    status: "In progress",
    priority: "Medium",
    dueDate: "Aug 28",
    dueLabel: "Tomorrow",
  },
  {
    id: 4,
    title: "Prepare sprint release notes",
    project: "Atlas Mobile",
    status: "To do",
    priority: "Medium",
    dueDate: "Aug 29",
    dueLabel: "Aug 29",
  },
  {
    id: 5,
    title: "Review database schema",
    project: "WorkSphere",
    status: "To do",
    priority: "Low",
    dueDate: "Aug 30",
    dueLabel: "Aug 30",
  },
  {
    id: 6,
    title: "Clean up unused components",
    project: "Mercury Web",
    status: "Done",
    priority: "Low",
    dueDate: "Aug 26",
    dueLabel: "Completed",
  },
]

const statusFilters = [
  "All",
  "To do",
  "In progress",
  "Done",
] as const

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

const priorityOrder: Record<TaskPriority, number> = {
  High: 1,
  Medium: 2,
  Low: 3,
}

const dueDateOrder: Record<string, number> = {
  "Aug 26": 1,
  "Aug 27": 2,
  "Aug 28": 3,
  "Aug 29": 4,
  "Aug 30": 5,
}

function MyWorkPage() {
  const [taskList, setTaskList] =
    useState<Task[]>(initialTasks)

  const [search, setSearch] = useState("")

  const [activeStatus, setActiveStatus] =
    useState<(typeof statusFilters)[number]>("All")

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("All")

  const [sortOption, setSortOption] =
    useState<SortOption>("Due date")

  const [showFilters, setShowFilters] =
    useState(false)

  const [showSort, setShowSort] =
    useState(false)

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filteredTasks = taskList.filter((task) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.project.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        activeStatus === "All" ||
        task.status === activeStatus

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    })

    return [...filteredTasks].sort((a, b) => {
      if (sortOption === "Title") {
        return a.title.localeCompare(b.title)
      }

      if (sortOption === "Priority") {
        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        )
      }

      return (
        (dueDateOrder[a.dueDate] ?? 99) -
        (dueDateOrder[b.dueDate] ?? 99)
      )
    })
  }, [
    taskList,
    search,
    activeStatus,
    priorityFilter,
    sortOption,
  ])

  const todayTasks = visibleTasks.filter(
    (task) =>
      task.dueLabel === "Today" &&
      task.status !== "Done",
  )

  const upcomingTasks = visibleTasks.filter(
    (task) =>
      task.dueLabel !== "Today" &&
      task.status !== "Done",
  )

  const completedTasks = visibleTasks.filter(
    (task) => task.status === "Done",
  )

  function handleToggleTask(taskId: number) {
    setTaskList((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        if (task.status === "Done") {
          return {
            ...task,
            status: "To do",
            dueLabel:
              task.dueLabel === "Completed"
                ? "Today"
                : task.dueLabel,
          }
        }

        return {
          ...task,
          status: "Done",
          dueLabel: "Completed",
        }
      }),
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Page header */}
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

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="size-4" />
            Add task
          </button>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            label="Total tasks"
            value={String(taskList.length)}
            description="assigned to you"
          />

          <SummaryCard
            label="In progress"
            value={String(
              taskList.filter(
                (task) => task.status === "In progress",
              ).length,
            )}
            description="currently active"
          />

          <SummaryCard
            label="Due today"
            value={String(
              taskList.filter(
                (task) =>
                  task.dueLabel === "Today" &&
                  task.status !== "Done",
              ).length,
            )}
            description="need attention"
          />

          <SummaryCard
            label="Completed"
            value={String(
              taskList.filter(
                (task) => task.status === "Done",
              ).length,
            )}
            description="completed tasks"
          />
        </section>

        {/* Task workspace */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search your tasks..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filters */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowFilters((current) => !current)
                  }
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
                        onClick={() => {
                          setPriorityFilter(priority)
                          setShowFilters(false)
                        }}
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

              {/* Sort */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowSort((current) => !current)
                  }
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
                        onClick={() => {
                          setSortOption(option)
                          setShowSort(false)
                        }}
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

          {/* Status tabs */}
          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max items-center gap-1 px-4">
              {statusFilters.map((status) => {
                const isActive =
                  activeStatus === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setActiveStatus(status)
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

          {/* Task list */}
          <div>
            <TaskGroup
              title="Today"
              tasks={todayTasks}
              onToggleTask={handleToggleTask}
            />

            <TaskGroup
              title="Upcoming"
              tasks={upcomingTasks}
              onToggleTask={handleToggleTask}
            />

            <TaskGroup
              title="Completed"
              tasks={completedTasks}
              onToggleTask={handleToggleTask}
            />

            {visibleTasks.length === 0 && (
              <EmptyState
                search={search}
                activeStatus={activeStatus}
              />
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function TaskGroup({
  title,
  tasks,
  onToggleTask,
}: {
  title: string
  tasks: Task[]
  onToggleTask: (taskId: number) => void
}) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            {title}
          </h2>

          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggleTask={onToggleTask}
          />
        ))}
      </div>
    </section>
  )
}

function TaskRow({
  task,
  onToggleTask,
}: {
  task: Task
  onToggleTask: (taskId: number) => void
}) {
  const completed = task.status === "Done"

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/20 sm:px-5">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggleTask(task.id)}
        aria-label={
          completed
            ? `Mark ${task.title} as incomplete`
            : `Mark ${task.title} as complete`
        }
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
          completed
            ? "border-foreground bg-foreground text-background"
            : "border-muted-foreground/40 hover:border-foreground",
        ].join(" ")}
      >
        {completed && (
          <Check
            className="size-3"
            strokeWidth={2.5}
          />
        )}
      </button>

      {/* Task */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={[
              "truncate text-sm font-medium",
              completed &&
                "text-muted-foreground line-through",
            ].join(" ")}
          >
            {task.title}
          </p>

          <PriorityBadge priority={task.priority} />
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {task.project}
          </span>

          <span className="size-0.5 shrink-0 rounded-full bg-muted-foreground/50" />

          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Due date */}
      <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        {task.dueLabel === "Today" ? (
          <Clock3 className="size-3" />
        ) : (
          <CalendarDays className="size-3" />
        )}

        <span>{task.dueDate}</span>
      </div>

      {/* More */}
      <button
        type="button"
        aria-label={`More options for ${task.title}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  )
}

function PriorityBadge({
  priority,
}: {
  priority: TaskPriority
}) {
  const styles = {
    High: "bg-red-500/10 text-red-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Low: "bg-emerald-500/10 text-emerald-400",
  }

  return (
    <span
      className={[
        "hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex",
        styles[priority],
      ].join(" ")}
    >
      {priority}
    </span>
  )
}

function StatusBadge({
  status,
}: {
  status: TaskStatus
}) {
  const Icon =
    status === "Done"
      ? Check
      : status === "In progress"
        ? Clock3
        : Circle

  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-2.5" />
      {status}
    </span>
  )
}

function EmptyState({
  search,
  activeStatus,
}: {
  search: string
  activeStatus: (typeof statusFilters)[number]
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium">
        No tasks found
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {search
          ? `No tasks match "${search}".`
          : `There are no ${activeStatus.toLowerCase()} tasks right now.`}
      </p>
    </div>
  )
}

export default MyWorkPage
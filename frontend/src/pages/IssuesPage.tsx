import { useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react"

import CreateIssueModal from "@/components/issues/CreateIssueModal"
import DashboardLayout from "@/components/layout/DashboardLayout"

type IssueStatus = "Open" | "In progress" | "Resolved"
type IssuePriority = "Critical" | "High" | "Medium" | "Low"

interface Issue {
  id: number
  key: string
  title: string
  project: string
  status: IssueStatus
  priority: IssuePriority
  assignee: string
  initials: string
  dueDate: string
  description?: string
}

interface CreateIssueData {
  title: string
  description: string
  project: string
  priority: IssuePriority
  assignee: string
  dueDate: string
}

const statusFilters = [
  "All",
  "Open",
  "In progress",
  "Resolved",
] as const

type StatusFilter = (typeof statusFilters)[number]

const priorityFilters = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
] as const

type PriorityFilter = (typeof priorityFilters)[number]

function IssuesPage() {
  const [issues, setIssues] =
    useState<Issue[]>([])

  const [search, setSearch] = useState("")

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All")

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("All")

  const [showStatusMenu, setShowStatusMenu] =
    useState(false)

  const [showPriorityMenu, setShowPriorityMenu] =
    useState(false)

  const [showCreateModal, setShowCreateModal] =
    useState(false)

  const visibleIssues = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return issues.filter((issue) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        issue.key
          .toLowerCase()
          .includes(normalizedSearch) ||
        issue.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        issue.project
          .toLowerCase()
          .includes(normalizedSearch) ||
        issue.assignee
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === "All" ||
        issue.status === statusFilter

      const matchesPriority =
        priorityFilter === "All" ||
        issue.priority === priorityFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    })
  }, [
    issues,
    search,
    statusFilter,
    priorityFilter,
  ])

  const openCount = issues.filter(
    (issue) => issue.status === "Open",
  ).length

  const inProgressCount = issues.filter(
    (issue) => issue.status === "In progress",
  ).length

  const resolvedCount = issues.filter(
    (issue) => issue.status === "Resolved",
  ).length

  const criticalCount = issues.filter(
    (issue) => issue.priority === "Critical",
  ).length

  function handleCreateIssue(
    data: CreateIssueData,
  ) {
    const nextId =
      issues.length > 0
        ? Math.max(
            ...issues.map((issue) => issue.id),
          ) + 1
        : 1

    const projectCode = data.project
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase()

    const prefix = projectCode || "PRJ"

    const projectIssueNumbers = issues
      .filter(
        (issue) => issue.project === data.project,
      )
      .map((issue) => {
        const match = issue.key.match(
          new RegExp(`^${prefix}-(\\d+)$`),
        )

        return match
          ? Number(match[1])
          : 0
      })

    const highestProjectNumber =
      projectIssueNumbers.length > 0
        ? Math.max(...projectIssueNumbers)
        : 0

    const nextIssueNumber =
      highestProjectNumber + 1

    const initials = data.assignee
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const formattedDueDate =
      data.dueDate
        ? new Date(
            `${data.dueDate}T00:00:00`,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          })
        : "No due date"

    const newIssue: Issue = {
      id: nextId,
      key: `${prefix}-${nextIssueNumber}`,
      title: data.title,
      description: data.description,
      project: data.project,
      status: "Open",
      priority: data.priority,
      assignee: data.assignee,
      initials: initials || "NA",
      dueDate: formattedDueDate,
    }

    setIssues((currentIssues) => [
      newIssue,
      ...currentIssues,
    ])

    setShowCreateModal(false)

    setSearch("")
    setStatusFilter("All")
    setPriorityFilter("All")
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Workspace
            </p>

            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
              Issues
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Track bugs, blockers, and work that needs attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="size-4" />
            Create issue
          </button>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            icon={AlertCircle}
            label="Open issues"
            value={String(openCount)}
            description="need attention"
          />

          <SummaryCard
            icon={Clock3}
            label="In progress"
            value={String(inProgressCount)}
            description="currently being worked on"
          />

          <SummaryCard
            icon={Check}
            label="Resolved"
            value={String(resolvedCount)}
            description="closed issues"
          />

          <SummaryCard
            icon={TriangleAlert}
            label="Critical"
            value={String(criticalCount)}
            description="highest priority"
          />
        </section>

        {/* Issues workspace */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[380px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search issues..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Status filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusMenu(
                      (current) => !current,
                    )
                    setShowPriorityMenu(false)
                  }}
                  className={[
                    "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                    statusFilter !== "All"
                      ? "border-foreground/30 bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  Status
                  <ChevronDown className="size-3.5" />
                </button>

                {showStatusMenu && (
                  <FilterMenu
                    title="Issue status"
                    options={statusFilters}
                    value={statusFilter}
                    onChange={(value) => {
                      setStatusFilter(value)
                      setShowStatusMenu(false)
                    }}
                  />
                )}
              </div>

              {/* Priority filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriorityMenu(
                      (current) => !current,
                    )
                    setShowStatusMenu(false)
                  }}
                  className={[
                    "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                    priorityFilter !== "All"
                      ? "border-foreground/30 bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  Priority
                  <ChevronDown className="size-3.5" />
                </button>

                {showPriorityMenu && (
                  <FilterMenu
                    title="Issue priority"
                    options={priorityFilters}
                    value={priorityFilter}
                    onChange={(value) => {
                      setPriorityFilter(value)
                      setShowPriorityMenu(false)
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status tabs */}
          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max items-center gap-1 px-4">
              {statusFilters.map((status) => {
                const isActive =
                  statusFilter === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status)
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

          {/* Desktop table header */}
          <div className="hidden border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:grid xl:grid-cols-[90px_minmax(280px,1fr)_130px_100px_145px_100px_28px] xl:items-center xl:gap-4">
            <span>ID</span>
            <span>Issue</span>
            <span>Project</span>
            <span>Priority</span>
            <span>Assignee</span>
            <span>Due</span>
            <span />
          </div>

          {/* Issue list */}
          {visibleIssues.length > 0 ? (
            <div className="divide-y divide-border">
              {visibleIssues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                />
              ))}
            </div>
          ) : (
            <EmptyState search={search} />
          )}
        </section>
      </div>

      {/* Create Issue Modal */}
      <CreateIssueModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateIssue}
      />
    </DashboardLayout>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof AlertCircle
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function FilterMenu<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl">
      <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition",
            value === option
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          {option}

          {value === option && (
            <Check className="size-3.5" />
          )}
        </button>
      ))}
    </div>
  )
}

function IssueRow({
  issue,
}: {
  issue: Issue
}) {
  return (
    <div className="group relative px-4 py-4 transition-colors hover:bg-muted/20 sm:px-5 xl:grid xl:grid-cols-[90px_minmax(280px,1fr)_130px_100px_145px_100px_28px] xl:items-center xl:gap-4">
      {/* Issue ID */}
      <span className="text-[11px] font-medium text-muted-foreground">
        {issue.key}
      </span>

      {/* Issue */}
      <div className="mt-2 min-w-0 xl:mt-0">
        <div className="flex min-w-0 items-center gap-2">
          <IssueStatusIcon status={issue.status} />

          <p className="truncate text-sm font-medium">
            {issue.title}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground xl:hidden">
          <span>{issue.project}</span>

          <span className="size-0.5 rounded-full bg-muted-foreground/50" />

          <span>{issue.dueDate}</span>
        </div>
      </div>

      {/* Project */}
      <span className="hidden truncate text-xs text-muted-foreground xl:block">
        {issue.project}
      </span>

      {/* Priority */}
      <PriorityBadge priority={issue.priority} />

      {/* Assignee */}
      <div className="mt-3 flex items-center gap-2 xl:mt-0">
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-[9px] font-semibold">
          {issue.initials}
        </div>

        <span className="truncate text-xs text-muted-foreground">
          {issue.assignee}
        </span>
      </div>

      {/* Due */}
      <span className="hidden text-xs text-muted-foreground xl:block">
        {issue.dueDate}
      </span>

      {/* Actions */}
      <button
        type="button"
        aria-label={`More options for ${issue.key}`}
        className="absolute right-4 top-4 hidden size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground group-hover:flex xl:static xl:flex"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {/* Mobile status */}
      <div className="mt-3 flex items-center justify-between xl:hidden">
        <StatusBadge status={issue.status} />

        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          View
          <ArrowUpRight className="size-3" />
        </button>
      </div>
    </div>
  )
}

function IssueStatusIcon({
  status,
}: {
  status: IssueStatus
}) {
  if (status === "Resolved") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <Check className="size-3" />
      </span>
    )
  }

  if (status === "In progress") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
        <Clock3 className="size-3" />
      </span>
    )
  }

  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
      <CircleDot className="size-3" />
    </span>
  )
}

function StatusBadge({
  status,
}: {
  status: IssueStatus
}) {
  const styles = {
    Open: "bg-red-500/10 text-red-400",
    "In progress": "bg-amber-500/10 text-amber-400",
    Resolved: "bg-emerald-500/10 text-emerald-400",
  }

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  )
}

function PriorityBadge({
  priority,
}: {
  priority: IssuePriority
}) {
  const styles = {
    Critical: "bg-red-500/10 text-red-400",
    High: "bg-orange-500/10 text-orange-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Low: "bg-emerald-500/10 text-emerald-400",
  }

  return (
    <span
      className={[
        "mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold xl:mt-0",
        styles[priority],
      ].join(" ")}
    >
      {priority}
    </span>
  )
}

function EmptyState({
  search,
}: {
  search: string
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-sm font-medium">
        No issues found
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {search
          ? `No issues match "${search}".`
          : "There are no issues in this view."}
      </p>
    </div>
  )
}

export default IssuesPage
import { useId } from "react"
import { ArrowRight, CalendarClock, Clock3, Search, ShieldAlert, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"

import DashboardLayout from "@/components/layout/DashboardLayout"
import type { Task } from "@/pages/MyWorkPage/types"
import useTeamWorkload, { isOverdue } from "./hooks/useTeamWorkload"
import type { WorkloadPeriod, WorkloadStatus } from "./hooks/useTeamWorkload"

const statuses: WorkloadStatus[] = ["All", "Open", "Completed", "Overdue"]

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function formatDueDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day))
}

function MemberWorkload({ name, email, tasks }: { name: string; email: string; tasks: Task[] }) {
  const completed = tasks.filter((task) => task.status === "DONE").length
  const open = tasks.length - completed
  const overdue = tasks.filter(isOverdue).length
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">{initials(name) || "U"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{name}</h3>
          <p className="truncate text-xs text-muted-foreground">{email} <span className="px-1">·</span> Signed-in account</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-right">
          <p className="text-sm font-semibold tabular-nums">{tasks.length}</p>
          <p className="text-[10px] text-muted-foreground">assigned</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-y border-border bg-muted/15">
        <WorkloadMetric label="Open" value={open} />
        <WorkloadMetric label="Completed" value={completed} />
        <WorkloadMetric label="Overdue" value={overdue} tone={overdue > 0 ? "danger" : "normal"} />
      </div>

      <div className="px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="text-muted-foreground">Completion across matching tasks</span>
          <span className="font-medium tabular-nums">{tasks.length ? `${completion}%` : "No assigned tasks"}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Completion across ${tasks.length} matching assigned tasks`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
          <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {tasks.length > 0 && (
        <ul className="divide-y divide-border border-t border-border" aria-label={`Tasks assigned to ${name}`}>
          {tasks.map((task) => (
            <li key={task.id} className="flex min-w-0 items-center gap-3 px-4 py-2.5 sm:px-5">
              <span className={`size-1.5 shrink-0 rounded-full ${task.status === "DONE" ? "bg-chart-4" : isOverdue(task) ? "bg-destructive" : "bg-primary"}`} aria-hidden="true" />
              <span className={`min-w-0 flex-1 truncate text-xs font-medium ${task.status === "DONE" ? "text-muted-foreground line-through" : ""}`}>{task.title}</span>
              <span className={`inline-flex shrink-0 items-center gap-1 text-[10px] ${isOverdue(task) ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                {isOverdue(task) && <ShieldAlert className="size-3" aria-hidden="true" />}
                {task.dueDate ? (isOverdue(task) ? `Overdue · ${formatDueDate(task.dueDate)}` : formatDueDate(task.dueDate)) : "No due date"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function WorkloadMetric({ label, value, tone = "normal" }: { label: string; value: number; tone?: "normal" | "danger" }) {
  return (
    <div className="px-3 py-2.5 text-center">
      <p className={`text-sm font-semibold tabular-nums ${tone === "danger" ? "text-destructive" : ""}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function InputAvailability({ label, available, detail }: { label: string; available: boolean; detail: string }) {
  return (
    <li className="flex items-start gap-2.5 py-2">
      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${available ? "bg-primary" : "bg-muted-foreground/40"}`} aria-hidden="true" />
      <span className="min-w-0">
        <span className="text-xs font-medium">{label}</span>
        <span className="ml-2 text-[10px] text-muted-foreground">{available ? "Available" : "Not available"}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{detail}</span>
      </span>
    </li>
  )
}

function TeamsPage() {
  const searchId = useId()
  const periodId = useId()
  const statusId = useId()
  const {
    user,
    assignedTasks,
    matchingTasks,
    memberMatchesSearch,
    search,
    setSearch,
    period,
    setPeriod,
    status,
    setStatus,
    counts,
  } = useTeamWorkload()

  const memberVisible = Boolean(user && memberMatchesSearch)

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1280px] space-y-5 pb-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Workspace / Team</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Team workload</h1>
            <p className="mt-1 text-sm text-muted-foreground">A view of assigned work from the task data available in this session.</p>
          </div>
          <Link to="/workspace" className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium text-card-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            Workspace setup <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </header>

        <div className="flex flex-wrap items-start gap-2 rounded-md border border-primary/15 bg-primary/[0.04] px-3 py-2.5 text-xs text-muted-foreground">
          <UsersRound className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="min-w-0 flex-1 leading-relaxed">The workspace member directory is not connected. This view can currently report only tasks assigned to your signed-in account; task data is session-only and does not persist after reload.</p>
          <span className="shrink-0 rounded border border-border bg-background px-2 py-1 text-[10px]">Account workload only</span>
        </div>

        <section aria-labelledby="workload-summary-heading">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="workload-summary-heading" className="text-sm font-semibold">Workload overview</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Counts update with the due-date period and task-status filters.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={periodId} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarClock className="size-3.5" aria-hidden="true" />Due-date period</label>
              <select id={periodId} value={period} onChange={(event) => setPeriod(event.target.value as WorkloadPeriod)} className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40">
                <option value="all">All due dates</option>
                <option value="7">Overdue + next 7 days</option>
                <option value="30">Overdue + next 30 days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <SummaryTile label="Assigned tasks" value={counts.assigned} detail="in selected view" />
            <SummaryTile label="Open" value={counts.open} detail="not completed" />
            <SummaryTile label="Completed" value={counts.completed} detail="marked done" />
            <SummaryTile label="Overdue" value={counts.overdue} detail="open past due date" danger={counts.overdue > 0} />
          </div>
        </section>

        <section aria-labelledby="member-workload-heading" className="overflow-hidden rounded-lg border border-border bg-card">
          <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 id="member-workload-heading" className="text-sm font-semibold">Member workload</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{user ? "Showing members with task data available to your account." : "No signed-in member data is available."}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                <label htmlFor={searchId} className="sr-only">Search team members</label>
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" />
              </div>
              <label htmlFor={statusId} className="sr-only">Filter tasks by status</label>
              <select id={statusId} value={status} onChange={(event) => setStatus(event.target.value as WorkloadStatus)} className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40">
                {statuses.map((value) => <option key={value} value={value}>{value === "All" ? "All task statuses" : value}</option>)}
              </select>
            </div>
          </header>

          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/15 px-4 py-2 sm:px-5">
            <p className="text-[11px] text-muted-foreground" aria-live="polite">{memberVisible ? "1 account" : "0 accounts"} · {matchingTasks.length} matching {matchingTasks.length === 1 ? "task" : "tasks"}</p>
            <p className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex"><Clock3 className="size-3" aria-hidden="true" />No capacity data</p>
          </div>

          <div className="space-y-3 p-3 sm:p-4">
            {memberVisible && user ? (
              <MemberWorkload name={user.name} email={user.email} tasks={matchingTasks} />
            ) : (
              <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
                <p className="text-xs font-medium">{user ? (search ? "No matching members" : "No matching assigned tasks") : "Member data unavailable"}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{user ? "Try another search or adjust the date and status filters. Other workspace members are not available to this frontend yet." : "Sign in to view tasks assigned to your account."}</p>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="recommendation-preview-heading" className="rounded-lg border border-border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
            <div>
              <h2 id="recommendation-preview-heading" className="text-sm font-semibold">Assignment recommendation preview</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Future capability · recommendations are not available</p>
            </div>
            <span className="rounded border border-border bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground">Preview only</span>
          </header>
          <div className="grid gap-4 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)] sm:px-5">
            <ul className="divide-y divide-border sm:grid sm:grid-cols-2 sm:gap-x-5 sm:divide-y-0">
              <InputAvailability label="Workspace membership" available={false} detail="A real workspace member directory is required for team-wide assignment." />
              <InputAvailability label="Task assignments" available detail={assignedTasks.length ? "Task counts are visible for your signed-in account only." : "No tasks are currently assigned to your account."} />
              <InputAvailability label="Deadlines" available={assignedTasks.some((task) => Boolean(task.dueDate))} detail="Task due dates can inform urgency when present." />
              <InputAvailability label="Estimated effort" available={false} detail="Task records do not include estimates or remaining effort." />
              <InputAvailability label="Skills" available={false} detail="No member skills data is connected." />
              <InputAvailability label="Availability" available={false} detail="No schedule, leave, or capacity data is connected." />
            </ul>
            <div className="flex flex-col justify-center rounded-md border border-dashed border-border bg-muted/15 px-3 py-3">
              <p className="text-xs font-medium">No recommendation generated</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Recommendations require shared member and workload data. This preview does not assign work or rank team members.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="directory-status-heading" className="flex flex-col gap-3 rounded-lg border border-border bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 id="directory-status-heading" className="text-xs font-semibold">Workspace member directory</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Team creation, invitations, roles, and workspace membership are not connected to this page.</p>
          </div>
          <Link to="/workspace" className="inline-flex h-8 w-fit shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[11px] font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">Workspace setup <ArrowRight className="size-3" aria-hidden="true" /></Link>
        </section>
      </div>
    </DashboardLayout>
  )
}

function SummaryTile({ label, value, detail, danger = false }: { label: string; value: number; detail: string; danger?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${danger ? "text-destructive" : ""}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{detail}</p>
    </div>
  )
}

export default TeamsPage

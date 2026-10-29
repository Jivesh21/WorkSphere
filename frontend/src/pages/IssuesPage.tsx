import { useEffect, useMemo, useState, type ReactNode } from "react"
import { AlertCircle, Check, CircleDot, Clock3, Kanban, Plus, Search, TriangleAlert, X } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import * as m from "motion/react-m"

import CreateIssueModal from "@/components/issues/CreateIssueModal"
import IssueDetailsDialog from "@/components/issues/IssueDetailsDialog"
import DashboardLayout from "@/components/layout/DashboardLayout"
import useIssues from "@/hooks/useIssues"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { issuePriorities, issueStatuses, type Issue, type IssueFormValues, type IssuePriority, type IssueStatus } from "@/pages/issues/types"

const statusFilters: Array<"All" | IssueStatus> = ["All", ...issueStatuses]
const priorityFilters: Array<"All" | IssuePriority> = ["All", ...issuePriorities]

function formatDate(value: string) {
  if (!value) return ""
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date)
}

function IssuesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { issues, createIssue, updateIssue } = useIssues()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All")
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityFilters)[number]>("All")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  useEffect(() => {
    if ((location.state as { quickCreate?: string } | null)?.quickCreate !== "issue") return
    setCreateOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const issueId = (location.state as { openIssue?: number } | null)?.openIssue
    if (typeof issueId !== "number") return
    setSelectedIssue(issues.find((issue) => issue.id === issueId) ?? null)
    navigate(location.pathname, { replace: true, state: null })
  }, [issues, location.pathname, location.state, navigate])

  const visibleIssues = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return issues.filter((issue) => {
      const matchesSearch = !query || [issue.key, issue.title, issue.project, issue.assignee]
        .some((value) => value.toLocaleLowerCase().includes(query))
      const matchesStatus = statusFilter === "All" || issue.status === statusFilter
      const matchesPriority = priorityFilter === "All" || issue.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [issues, search, statusFilter, priorityFilter])

  function saveIssue(values: IssueFormValues, existingIssue?: Issue): string | undefined {
    if (!values.title.trim()) return "Enter an issue title."
    if (existingIssue) {
      updateIssue(existingIssue.id, values)
      setEditingIssue(null)
      return undefined
    }

    createIssue(values)
    setCreateOpen(false)
    setSearch("")
    setStatusFilter("All")
    setPriorityFilter("All")
    return undefined
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Issues</h1>
            <p className="mt-2 text-sm text-muted-foreground">Track bugs, blockers, and work that needs attention.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/board" className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-card-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <Kanban className="size-4" aria-hidden="true" />Board
            </Link>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create issue
            </button>
          </div>
        </section>

        <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Issues are shared between the Issues and Board views in this app session only. They are not saved to an account or backend yet.
        </p>

        <section aria-label="Issues list" className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <label htmlFor="issue-search" className="sr-only">Search issues</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="issue-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, key, project, or assignee"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear issue search"
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <div className="flex max-w-full items-center gap-1 overflow-x-auto" role="group" aria-label="Filter issues by status">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                    className={`shrink-0 rounded-md px-2.5 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${statusFilter === status ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    {status}
                    <span className="ml-1.5 tabular-nums text-muted-foreground">
                      {status === "All" ? issues.length : issues.filter((issue) => issue.status === status).length}
                    </span>
                  </button>
                ))}
              </div>
              <label className="sr-only" htmlFor="issue-priority-filter">Filter issues by priority</label>
              <select
                id="issue-priority-filter"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityFilters)[number])}
                className="h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {priorityFilters.map((priority) => <option key={priority} value={priority}>{priority === "All" ? "All priorities" : priority}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 sm:px-5">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {visibleIssues.length} {visibleIssues.length === 1 ? "issue" : "issues"} in this session
            </p>
            <p className="hidden text-[10px] text-muted-foreground sm:block">Select an issue to view details</p>
          </div>

          {visibleIssues.length > 0 ? (
            <m.div role="list" aria-label="Issues" initial="hidden" animate="visible" variants={staggerContainer} className="divide-y divide-border">
              {visibleIssues.map((issue) => (
                <m.div key={issue.id} role="listitem" variants={staggerItem}>
                  <IssueRow issue={issue} onOpen={() => setSelectedIssue(issue)} />
                </m.div>
              ))}
            </m.div>
          ) : issues.length === 0 ? (
            <EmptyState
              title="No issues yet"
              description="Create an issue to record a bug, blocker, or piece of work."
              action={<button type="button" onClick={() => setCreateOpen(true)} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"><Plus className="size-3.5" aria-hidden="true" />Create an issue</button>}
            />
          ) : (
            <EmptyState
              title="No matching issues"
              description="Try another search or adjust the status and priority filters."
              action={<button type="button" onClick={() => { setSearch(""); setStatusFilter("All"); setPriorityFilter("All") }} className="mt-4 rounded-md px-3 py-2 text-xs font-medium text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>}
            />
          )}
        </section>
      </div>

      {createOpen && (
        <CreateIssueModal
          onClose={() => setCreateOpen(false)}
          onSave={(values) => saveIssue(values)}
        />
      )}
      {editingIssue && (
        <CreateIssueModal
          key={editingIssue.id}
          issue={editingIssue}
          onClose={() => setEditingIssue(null)}
          onSave={(values) => saveIssue(values, editingIssue)}
        />
      )}
      {selectedIssue && (
        <IssueDetailsDialog
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onEdit={() => {
            const latestIssue = issues.find((issue) => issue.id === selectedIssue.id) ?? selectedIssue
            setEditingIssue(latestIssue)
            setSelectedIssue(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}

function IssueRow({ issue, onOpen }: { issue: Issue; onOpen: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${issue.key}: ${issue.title}`}
        className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 xl:grid-cols-[minmax(0,1fr)_120px_110px_130px]"
      >
        <span className="flex min-w-0 items-start gap-3">
          <IssueStatusIcon status={issue.status} />
          <span className="min-w-0">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-sm font-medium">{issue.title}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{issue.key}</span>
            </span>
            <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
              <span>{issue.status}</span>
              {(issue.project || issue.assignee || issue.dueDate) && <span aria-hidden="true">|</span>}
              {issue.project && <span className="truncate">{issue.project}</span>}
              {issue.project && issue.assignee && <span aria-hidden="true">|</span>}
              {issue.assignee && <span className="truncate">{issue.assignee}</span>}
              {issue.dueDate && <><span aria-hidden="true">|</span><span>Due {formatDate(issue.dueDate)}</span></>}
            </span>
          </span>
        </span>
        <span className="justify-self-end xl:justify-self-start"><PriorityBadge priority={issue.priority} /></span>
        <span className="hidden text-xs text-muted-foreground xl:block">{issue.status}</span>
        <span className="hidden text-xs text-muted-foreground xl:block">{issue.dueDate ? formatDate(issue.dueDate) : "No due date"}</span>
      </button>
    </div>
  )
}

function IssueStatusIcon({ status }: { status: IssueStatus }) {
  const Icon = status === "Resolved" ? Check : status === "In progress" ? Clock3 : CircleDot
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground" aria-hidden="true">
      <Icon className="size-3" />
    </span>
  )
}

function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const icon = priority === "Critical" ? <TriangleAlert className="size-3" aria-hidden="true" /> : null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-foreground">
      {icon}{priority}
    </span>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground"><AlertCircle className="size-5" aria-hidden="true" /></span>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

export default IssuesPage

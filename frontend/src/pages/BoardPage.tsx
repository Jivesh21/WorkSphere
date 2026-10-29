import { useMemo, useState, type DragEvent, type ReactNode } from "react"
import { ArrowRight, CheckCircle2, CircleDot, Clock3, GripVertical, Kanban, Plus, Search, TriangleAlert, X } from "lucide-react"
import { Link } from "react-router-dom"
import * as m from "motion/react-m"

import CreateIssueModal from "@/components/issues/CreateIssueModal"
import IssueDetailsDialog from "@/components/issues/IssueDetailsDialog"
import DashboardLayout from "@/components/layout/DashboardLayout"
import useIssues from "@/hooks/useIssues"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { issuePriorities, issueStatuses, type Issue, type IssueFormValues, type IssuePriority, type IssueStatus } from "@/pages/issues/types"

function BoardPage() {
  const { issues, createIssue, updateIssue, updateIssueStatus } = useIssues()
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"All" | IssuePriority>("All")
  const [createOpen, setCreateOpen] = useState(false)
  const [draggedIssueId, setDraggedIssueId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<IssueStatus | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null)
  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId)

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return issues.filter((issue) => {
      const matchesSearch = !query || [issue.key, issue.title, issue.project, issue.assignee]
        .some((value) => value.toLocaleLowerCase().includes(query))
      return matchesSearch && (priorityFilter === "All" || issue.priority === priorityFilter)
    })
  }, [issues, search, priorityFilter])

  const filtersActive = Boolean(search.trim()) || priorityFilter !== "All"

  function clearFilters() {
    setSearch("")
    setPriorityFilter("All")
  }

  function handleCreateIssue(values: IssueFormValues) {
    if (!values.title.trim()) return "Enter an issue title."
    createIssue(values)
    setCreateOpen(false)
    clearFilters()
    return undefined
  }

  function startDrag(event: DragEvent<HTMLButtonElement>, issue: Issue) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(issue.id))
    setDraggedIssueId(issue.id)
    setAnnouncement(`Moving ${issue.key}. Drop it on a workflow column.`)
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: IssueStatus) {
    event.preventDefault()
    const issueId = Number(event.dataTransfer.getData("text/plain"))
    const issue = issues.find((item) => item.id === issueId)
    if (issue && issue.status !== status) {
      updateIssueStatus(issue.id, status)
      setAnnouncement(`${issue.key} moved to ${status}.`)
    }
    setDraggedIssueId(null)
    setDropTarget(null)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Workspace / Issues</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Board</h1>
            <p className="mt-1 text-sm text-muted-foreground">Move issues through the current workflow.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/issues" className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium text-card-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              All issues <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Plus className="size-3.5" aria-hidden="true" />Create issue
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" role="note">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          Board and Issues share this session’s issue state. Changes are not saved after reload.
        </div>

        <section aria-label="Board controls" className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <label htmlFor="board-search" className="sr-only">Search board issues</label>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input id="board-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search issues, key, project, or assignee" className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear board search" className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><X className="size-3.5" aria-hidden="true" /></button>}
          </div>
          <label htmlFor="board-priority" className="sr-only">Filter board by priority</label>
          <select id="board-priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as "All" | IssuePriority)} className="h-9 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40">
            <option value="All">All priorities</option>
            {issuePriorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          {filtersActive && <button type="button" onClick={clearFilters} className="h-8 rounded-md px-2 text-xs font-medium text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>}
          <p className="text-xs text-muted-foreground sm:ml-auto" aria-live="polite">{filteredIssues.length} {filteredIssues.length === 1 ? "issue" : "issues"}</p>
        </section>

        {issues.length === 0 ? (
          <BoardEmptyState title="No issues on the board" description="Create an issue to see it move through the workflow." action={<button type="button" onClick={() => setCreateOpen(true)} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"><Plus className="size-3.5" />Create issue</button>} />
        ) : filteredIssues.length === 0 ? (
          <BoardEmptyState title="No matching issues" description="Try another search or priority filter." action={<button type="button" onClick={clearFilters} className="mt-3 rounded-md px-3 py-2 text-xs font-medium text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>} />
        ) : (
          <div role="region" aria-label="Issue workflow board" tabIndex={0} className="min-w-0 overflow-x-auto overscroll-x-contain rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="grid min-h-[360px] grid-flow-col auto-cols-[minmax(17rem,1fr)] gap-3 pb-2">
              {issueStatuses.map((status) => {
                const statusIssues = filteredIssues.filter((issue) => issue.status === status)
                const StatusIcon = status === "Resolved" ? CheckCircle2 : status === "In progress" ? Clock3 : CircleDot
                const isDropTarget = dropTarget === status && draggedIssueId !== null
                return (
                  <section key={status} aria-labelledby={`board-column-${slug(status)}`} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropTarget(status) }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget((current) => current === status ? null : current) }} onDrop={(event) => handleDrop(event, status)} className={`flex min-h-[320px] min-w-0 flex-col rounded-lg border bg-muted/20 transition-colors motion-reduce:transition-none ${isDropTarget ? "border-primary/60 bg-primary/5" : "border-border"}`}>
                    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
                      <h2 id={`board-column-${slug(status)}`} className="flex items-center gap-2 text-xs font-semibold"><span className={`flex size-6 items-center justify-center rounded-md ${status === "Resolved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : status === "In progress" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><StatusIcon className="size-3.5" aria-hidden="true" /></span>{status}</h2>
                      <span className="min-w-6 rounded-md border border-border bg-background px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums text-muted-foreground" aria-label={`${statusIssues.length} issues`}>{statusIssues.length}</span>
                    </header>
                    {statusIssues.length ? (
                      <m.ul initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-1 flex-col gap-2 p-2">
                        {statusIssues.map((issue) => <m.li key={issue.id} variants={staggerItem}><IssueCard issue={issue} dragging={draggedIssueId === issue.id} onOpen={() => setSelectedIssueId(issue.id)} onDragStart={startDrag} onDragEnd={() => { setDraggedIssueId(null); setDropTarget(null) }} onStatusChange={(nextStatus) => updateIssueStatus(issue.id, nextStatus)} /></m.li>)}
                      </m.ul>
                    ) : (
                      <div className="flex flex-1 items-center justify-center px-3 py-8 text-center text-xs text-muted-foreground">No issues in {status.toLowerCase()}.</div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        )}
        <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
      </div>
      {createOpen && <CreateIssueModal onClose={() => setCreateOpen(false)} onSave={handleCreateIssue} />}
      {selectedIssue && <IssueDetailsDialog issue={selectedIssue} onClose={() => setSelectedIssueId(null)} onEdit={() => { setEditingIssue(selectedIssue); setSelectedIssueId(null) }} />}
      {editingIssue && <CreateIssueModal key={editingIssue.id} issue={editingIssue} onClose={() => setEditingIssue(null)} onSave={(values) => { if (!values.title.trim()) return "Enter an issue title."; updateIssue(editingIssue.id, values); setEditingIssue(null); return undefined }} />}
    </DashboardLayout>
  )
}

function IssueCard({
  issue,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
  onStatusChange,
}: {
  issue: Issue
  dragging: boolean
  onOpen: () => void
  onDragStart: (event: DragEvent<HTMLButtonElement>, issue: Issue) => void
  onDragEnd: () => void
  onStatusChange: (status: IssueStatus) => void
}) {
  return (
    <article className={`min-w-0 rounded-md border border-border bg-card text-card-foreground transition-[border-color,box-shadow,opacity] hover:border-primary/30 motion-reduce:transition-none ${dragging ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 border-b border-border/70 px-2.5 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-medium text-muted-foreground">{issue.key}</span>
        <PriorityLabel priority={issue.priority} />
        <button type="button" draggable onDragStart={(event) => onDragStart(event, issue)} onDragEnd={onDragEnd} aria-label={`Drag ${issue.key} to another status column`} title="Drag to move; use the status menu for keyboard or touch" className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring"><GripVertical className="size-3.5" aria-hidden="true" /></button>
      </div>
      <div className="p-2.5">
        <button type="button" onClick={onOpen} aria-label={`Open ${issue.key}: ${issue.title}`} className="block w-full rounded text-left text-xs font-medium leading-5 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">{issue.title}</button>
        {issue.description && <p className="mt-1.5 line-clamp-2 whitespace-pre-wrap text-[11px] leading-4 text-muted-foreground">{issue.description}</p>}
        {(issue.project || issue.assignee || issue.dueDate) && <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
          {issue.project && <span className="max-w-full truncate">{issue.project}</span>}
          {issue.assignee && <span className="max-w-full truncate">{issue.assignee}</span>}
          {issue.dueDate && <span>{formatDate(issue.dueDate)}</span>}
        </div>}
        <label className="sr-only" htmlFor={`move-issue-${issue.id}`}>Change status for {issue.key}</label>
        <select id={`move-issue-${issue.id}`} value={issue.status} onChange={(event) => onStatusChange(event.target.value as IssueStatus)} className="mt-2.5 h-8 w-full rounded border border-input bg-background px-2 text-[11px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40">
          {issueStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
    </article>
  )
}

function PriorityLabel({ priority }: { priority: IssuePriority }) {
  const classes = priority === "Critical" ? "border-destructive/30 bg-destructive/10 text-destructive" : priority === "High" ? "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300" : priority === "Medium" ? "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300" : "border-border bg-muted/60 text-muted-foreground"
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${classes}`}>
    {priority === "Critical" && <TriangleAlert className="size-3" aria-hidden="true" />}{priority}
  </span>
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
}

function slug(value: string) {
  return value.toLowerCase().replaceAll(" ", "-")
}

function BoardEmptyState({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return <section className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-10 text-center">
    <span className="mb-3 flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground"><Kanban className="size-4" aria-hidden="true" /></span>
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
    {action}
  </section>
}

export default BoardPage

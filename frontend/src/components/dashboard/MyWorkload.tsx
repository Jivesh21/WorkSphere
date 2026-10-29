import { UserRound } from "lucide-react"

import useAuth from "@/hooks/useAuth"
import useTasks from "@/hooks/useTasks"

function MyWorkload() {
  const { user } = useAuth()
  const { tasks } = useTasks()
  const assigned = user ? tasks.filter((task) => task.assignedUserId === user.id) : []
  const completed = assigned.filter((task) => task.status === "DONE").length
  const completion = assigned.length ? Math.round((completed / assigned.length) * 100) : 0
  const initials = user?.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()

  return (
    <section aria-labelledby="workload-title" className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 id="workload-title" className="text-sm font-semibold">My workload</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Based on tasks assigned to your account</p>
        </div>
        <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
      </header>
      {user ? (
        <div className="flex items-center gap-3 px-4 py-4">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">{initials || "U"}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="shrink-0 text-xs tabular-nums text-muted-foreground">{assigned.length} assigned</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Completion of tasks assigned to you" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
              <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{completed} completed · {assigned.length - completed} open</p>
          </div>
        </div>
      ) : (
        <p className="px-4 py-5 text-xs text-muted-foreground">Sign in to view tasks assigned to your account.</p>
      )}
    </section>
  )
}

export default MyWorkload

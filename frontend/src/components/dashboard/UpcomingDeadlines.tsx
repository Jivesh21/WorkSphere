import { AlertCircle, CalendarClock } from "lucide-react"
import { Link } from "react-router-dom"

import useIssues from "@/hooks/useIssues"
import type { Issue } from "@/pages/issues/types"

function toLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number)
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function UpcomingDeadlines() {
  const { issues } = useIssues()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfWindow = new Date(today)
  endOfWindow.setDate(endOfWindow.getDate() + 7)

  const attentionIssues = issues
    .filter((issue) => issue.status !== "Resolved" && Boolean(issue.dueDate))
    .map((issue) => ({ issue, due: toLocalDate(issue.dueDate) }))
    .filter((item): item is { issue: Issue; due: Date } =>
      item.due !== null && item.due <= endOfWindow,
    )
    .sort((a, b) => a.due.getTime() - b.due.getTime())

  return (
    <section aria-label="Issues due soon" className="overflow-hidden rounded-md border border-border bg-card">
      {attentionIssues.length === 0 ? (
        <div className="flex min-h-12 items-center gap-2 px-2.5 py-2">
          <CalendarClock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-tight font-medium">Nothing due this week</p>
            <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
              No due-dated open issues are available in this session.
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border/80">
          {attentionIssues.slice(0, 5).map(({ issue, due }) => {
            const overdue = due < today
            return (
              <li key={issue.id}>
                <Link
                  to="/issues"
                  className="group flex min-w-0 items-center gap-2 px-2.5 py-2 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded ${overdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {overdue ? <AlertCircle className="size-3" aria-hidden="true" /> : <CalendarClock className="size-3" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] leading-tight font-medium text-foreground group-hover:text-primary">{issue.title}</span>
                    <span className="mt-1 block truncate text-[10px] leading-tight text-muted-foreground">{issue.key} · {issue.project}</span>
                  </span>
                  <span className={`shrink-0 text-[10px] leading-none font-medium tabular-nums ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                    {new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(due)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {attentionIssues.length > 5 && (
        <div className="border-t border-border px-2 py-1 text-right">
          <Link to="/issues" className="text-[10px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            View all {attentionIssues.length} due issues
          </Link>
        </div>
      )}
    </section>
  )
}

export default UpcomingDeadlines

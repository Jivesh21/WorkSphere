import { useEffect, useId, useRef } from "react"
import { CalendarDays, Pencil, X } from "lucide-react"
import * as m from "motion/react-m"
import { dialogOverlay, dialogPanel } from "@/lib/motion"
import type { Issue } from "@/pages/issues/types"

interface IssueDetailsDialogProps {
  issue: Issue
  onClose: () => void
  onEdit: () => void
}

function formatDate(value: string) {
  if (!value) return ""
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date)
}

function IssueDetailsDialog({ issue, onClose, onEdit }: IssueDetailsDialogProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()

  useEffect(() => {
    dialogRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <m.div
      {...dialogOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <m.section
        {...dialogPanel}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return
          const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          )
          const first = focusable.item(0)
          const last = focusable.item(focusable.length - 1)
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }}
        className="my-auto flex max-h-[min(760px,calc(100dvh-1.5rem))] w-full max-w-[540px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl outline-none sm:max-h-[min(760px,calc(100dvh-2.5rem))]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{issue.key}</p>
            <h2 id={titleId} className="mt-1 text-base font-semibold tracking-tight">{issue.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close issue details"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{issue.status}</span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{issue.priority} priority</span>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {issue.description || <span className="text-muted-foreground">No description provided.</span>}
            </p>
          </div>

          <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            {issue.project && (
              <div>
                <dt className="text-[11px] text-muted-foreground">Project</dt>
                <dd className="mt-1 text-sm">{issue.project}</dd>
              </div>
            )}
            {issue.assignee && (
              <div>
                <dt className="text-[11px] text-muted-foreground">Assignee</dt>
                <dd className="mt-1 text-sm">{issue.assignee}</dd>
              </div>
            )}
            {issue.dueDate && (
              <div>
                <dt className="text-[11px] text-muted-foreground">Due date</dt>
                <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
                  <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {formatDate(issue.dueDate)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 rounded-md border border-border bg-background px-4 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit issue
          </button>
        </footer>
      </m.section>
    </m.div>
  )
}

export default IssueDetailsDialog

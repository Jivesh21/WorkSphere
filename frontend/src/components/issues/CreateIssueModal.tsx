import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { X } from "lucide-react"
import * as m from "motion/react-m"
import { dialogOverlay, dialogPanel } from "@/lib/motion"
import { issuePriorities, issueStatuses, type Issue, type IssueFormValues, type IssuePriority, type IssueStatus } from "@/pages/issues/types"

interface IssueFormDialogProps {
  issue?: Issue
  onClose: () => void
  onSave: (values: IssueFormValues) => string | undefined
}

function CreateIssueModal({ issue, onClose, onSave }: IssueFormDialogProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [title, setTitle] = useState(issue?.title ?? "")
  const [description, setDescription] = useState(issue?.description ?? "")
  const [project, setProject] = useState(issue?.project ?? "")
  const [priority, setPriority] = useState<IssuePriority>(issue?.priority ?? "Medium")
  const [status, setStatus] = useState<IssueStatus>(issue?.status ?? "Open")
  const [assignee, setAssignee] = useState(issue?.assignee ?? "")
  const [dueDate, setDueDate] = useState(issue?.dueDate ?? "")
  const [error, setError] = useState("")

  useEffect(() => {
    titleInputRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError("Enter an issue title.")
      titleInputRef.current?.focus()
      return
    }

    const saveError = onSave({
      title: trimmedTitle,
      description: description.trim(),
      project: project.trim(),
      priority,
      status,
      assignee: assignee.trim(),
      dueDate,
    })
    if (saveError) setError(saveError)
  }

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return
          const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
        className="my-auto flex max-h-[min(760px,calc(100dvh-1.5rem))] w-full max-w-[540px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[min(760px,calc(100dvh-2.5rem))]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <div>
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {issue ? "Edit issue" : "Create issue"}
            </h2>
            <p id={descriptionId} className="mt-1 text-xs leading-5 text-muted-foreground">
              {issue ? `Update ${issue.key}.` : "Add details for the issue."} Changes are kept in this app session.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close issue form"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            <div>
              <label htmlFor="issue-title" className="mb-1.5 block text-xs font-medium">
                Title <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                ref={titleInputRef}
                id="issue-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setError("")
                }}
                maxLength={160}
                required
                aria-required="true"
                aria-invalid={error === "Enter an issue title."}
                aria-describedby={error === "Enter an issue title." ? "issue-title-error" : undefined}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                placeholder="Describe the issue"
              />
              {error === "Enter an issue title." && <p id="issue-title-error" className="mt-1.5 text-xs text-destructive">{error}</p>}
            </div>

            <div>
              <label htmlFor="issue-description" className="mb-1.5 block text-xs font-medium">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="issue-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                rows={3}
                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Add context or steps to reproduce"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="issue-project" className="mb-1.5 block text-xs font-medium">
                  Project <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="issue-project"
                  value={project}
                  onChange={(event) => setProject(event.target.value)}
                  maxLength={100}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  placeholder="Enter a project name"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Enter a label; project records aren’t connected to issues yet.
                </p>
              </div>
              <div>
                <label htmlFor="issue-priority" className="mb-1.5 flex items-center gap-2 text-xs font-medium"><span className={`size-2 rounded-full ${priority === "Critical" ? "bg-destructive" : priority === "High" ? "bg-amber-500" : priority === "Medium" ? "bg-sky-500" : "bg-muted-foreground"}`} aria-hidden="true" />Priority · {priority}</label>
                <select
                  id="issue-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as IssuePriority)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {issuePriorities.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="issue-status" className="mb-1.5 block text-xs font-medium">Status</label>
                <select
                  id="issue-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as IssueStatus)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {issueStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="issue-assignee" className="mb-1.5 block text-xs font-medium">
                  Assignee <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="issue-assignee"
                  value={assignee}
                  onChange={(event) => setAssignee(event.target.value)}
                  maxLength={100}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  placeholder="Enter a name"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Enter a name; there are no member records to select yet.</p>
              </div>
            </div>

            <div>
              <label htmlFor="issue-due-date" className="mb-1.5 block text-xs font-medium">
                Due date <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="issue-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-9 w-full max-w-[220px] rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-9 rounded-md border border-border bg-background px-4 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {issue ? "Save changes" : "Create issue"}
            </button>
          </footer>
        </form>
      </m.section>
    </m.div>
  )
}

export default CreateIssueModal

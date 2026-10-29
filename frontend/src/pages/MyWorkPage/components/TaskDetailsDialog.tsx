import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import * as m from "motion/react-m"

import { dialogOverlay, dialogPanel } from "@/lib/motion"
import { getTaskProgress } from "@/services/taskProgress"
import type { Task, TaskSubtask } from "../types"
import { taskPriorityLabels, taskStatusLabels } from "../types"
import TaskProgressBar from "./TaskProgressBar"

interface TaskDetailsDialogProps {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onAddSubtask: (title: string) => boolean
  onRenameSubtask: (subtaskId: number, title: string) => boolean
  onToggleSubtask: (subtaskId: number) => void
  onDeleteSubtask: (subtaskId: number) => void
}

function TaskDetailsDialog({
  task,
  onClose,
  onEdit,
  onAddSubtask,
  onRenameSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskDetailsDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const addInputRef = useRef<HTMLInputElement>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [addError, setAddError] = useState("")
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [renameError, setRenameError] = useState("")
  const progress = getTaskProgress(task)
  const completedSubtasks = progress?.completed ?? 0

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    closeButtonRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [])

  function addSubtask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newSubtaskTitle.trim()
    if (!title) {
      setAddError("Enter a subtask name.")
      addInputRef.current?.focus()
      return
    }
    if (title.length > 120) {
      setAddError("Subtask names must be 120 characters or fewer.")
      addInputRef.current?.focus()
      return
    }
    if (!onAddSubtask(title)) {
      setAddError("This task could not be updated. Try again.")
      return
    }
    setNewSubtaskTitle("")
    setAddError("")
  }

  function saveRename(event: FormEvent<HTMLFormElement>, subtask: TaskSubtask) {
    event.preventDefault()
    const title = editingTitle.trim()
    if (!title) {
      setRenameError("Enter a subtask name.")
      return
    }
    if (title.length > 120) {
      setRenameError("Subtask names must be 120 characters or fewer.")
      return
    }
    if (!onRenameSubtask(subtask.id, title)) {
      setRenameError("This subtask could not be updated. Try again.")
      return
    }
    setEditingSubtaskId(null)
    setEditingTitle("")
    setRenameError("")
  }

  return (
    <m.div
      {...dialogOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
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
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
        className="my-auto flex max-h-[min(760px,calc(100dvh-1.5rem))] w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[min(760px,calc(100dvh-2.5rem))]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Task details</p>
            <h2 id={titleId} className="mt-1 truncate text-base font-semibold tracking-tight">{task.title}</h2>
            <p id={descriptionId} className="mt-1 text-xs text-muted-foreground">
              Progress is separate from workflow status and is updated from this session's task record.
            </p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close task details" className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
          <section aria-label="Task information" className="grid gap-x-6 gap-y-3 rounded-lg border border-border bg-background/50 p-3 sm:grid-cols-2">
            <InfoField label="Status" value={taskStatusLabels[task.status]} />
            <InfoField label="Priority" value={taskPriorityLabels[task.priority]} />
            <InfoField label="Project" value={task.projectName ?? "No project"} />
            <InfoField label="Assignee" value={task.assignedUserName ?? "Unassigned"} />
            <InfoField label="Start date" value={formatDate(task.startDate)} />
            <InfoField label="Due date" value={formatDate(task.dueDate)} />
          </section>

          <section aria-labelledby="task-description-heading">
            <h3 id="task-description-heading" className="text-xs font-semibold">Description</h3>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {task.description || "No description provided."}
            </p>
          </section>

          <section aria-labelledby="task-progress-heading" className="rounded-lg border border-border p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="task-progress-heading" className="text-sm font-semibold">Progress</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {progress
                    ? `${progress.completed} of ${progress.total} subtasks complete; each counts equally.`
                    : "Not tracked. Add subtasks to calculate progress."}
                </p>
              </div>
              <span className="text-xl font-semibold tabular-nums tracking-tight">{progress ? `${progress.percentage}%` : "Not tracked"}</span>
            </div>
            {progress && <TaskProgressBar value={progress.percentage} className="mt-3 h-2" />}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Task status is separate. Completing every subtask does not change it.
            </p>
          </section>

          <section aria-labelledby="subtasks-heading">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h3 id="subtasks-heading" className="text-sm font-semibold">Subtasks</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Add smaller steps to calculate task progress.</p>
              </div>
              <span className="rounded bg-muted px-2 py-1 text-[10px] font-medium tabular-nums text-muted-foreground">{completedSubtasks}/{task.subtasks.length}</span>
            </div>

            {task.subtasks.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No subtasks yet. Add a step to start tracking progress.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex min-w-0 items-center gap-2 px-2.5 py-2">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => onToggleSubtask(subtask.id)}
                      aria-label={`${subtask.completed ? "Reopen" : "Complete"} subtask: ${subtask.title}`}
                      className="size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    />
                    {editingSubtaskId === subtask.id ? (
                      <form onSubmit={(event) => saveRename(event, subtask)} className="flex min-w-0 flex-1 items-center gap-1.5">
                        <label className="sr-only" htmlFor={`rename-subtask-${subtask.id}`}>Subtask name</label>
                        <input id={`rename-subtask-${subtask.id}`} value={editingTitle} onChange={(event) => { setEditingTitle(event.target.value); setRenameError("") }} maxLength={120} autoFocus className="h-8 min-w-0 flex-1 rounded border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        <button type="submit" aria-label="Save subtask name" className="flex size-8 shrink-0 items-center justify-center rounded text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Check className="size-4" aria-hidden="true" /></button>
                        <button type="button" onClick={() => { setEditingSubtaskId(null); setRenameError("") }} aria-label="Cancel subtask rename" className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><X className="size-4" aria-hidden="true" /></button>
                      </form>
                    ) : (
                      <>
                        <span className={`min-w-0 flex-1 break-words text-xs ${subtask.completed ? "text-muted-foreground line-through" : ""}`}>{subtask.title}</span>
                        <button type="button" onClick={() => { setEditingSubtaskId(subtask.id); setEditingTitle(subtask.title); setRenameError("") }} aria-label={`Rename subtask: ${subtask.title}`} className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><Pencil className="size-3.5" aria-hidden="true" /></button>
                        <button type="button" onClick={() => onDeleteSubtask(subtask.id)} aria-label={`Delete subtask: ${subtask.title}`} className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"><Trash2 className="size-3.5" aria-hidden="true" /></button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {renameError && <p role="alert" className="mt-1.5 text-xs text-destructive">{renameError}</p>}

            <form onSubmit={addSubtask} className="mt-2 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor="new-subtask-title">New subtask name</label>
                <input
                  ref={addInputRef}
                  id="new-subtask-title"
                  value={newSubtaskTitle}
                  onChange={(event) => { setNewSubtaskTitle(event.target.value); setAddError("") }}
                  maxLength={120}
                  placeholder="Add a subtask"
                  aria-invalid={Boolean(addError)}
                  aria-describedby={addError ? "new-subtask-error" : undefined}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
                />
                {addError && <p id="new-subtask-error" role="alert" className="mt-1 text-[11px] text-destructive">{addError}</p>}
              </div>
              <button type="submit" aria-label="Add subtask" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                <Plus className="size-3.5" aria-hidden="true" /> Add
              </button>
            </form>
          </section>
        </div>

        <footer className="flex shrink-0 justify-between gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <button type="button" onClick={() => onEdit(task)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <Pencil className="size-3.5" aria-hidden="true" /> Edit task
          </button>
          <button type="button" onClick={onClose} className="h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">Done</button>
        </footer>
      </m.section>
    </m.div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium">{value}</p>
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return "Not set"
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return "Not set"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" })
    .format(new Date(year, month - 1, day))
}

export default TaskDetailsDialog

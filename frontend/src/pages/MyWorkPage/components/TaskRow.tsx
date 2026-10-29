import { CalendarDays, Check, Clock3, ListTodo, Pencil, TriangleAlert } from "lucide-react"

import { getTaskProgress } from "@/services/taskProgress"
import type { Task } from "../types"
import PriorityBadge from "./PriorityBadge"
import TaskProgressBar from "./TaskProgressBar"
import StatusBadge from "./StatusBadge"

interface TaskRowProps {
  task: Task
  onToggleTask: (taskId: number) => void
  onEditTask: (task: Task) => void
  onViewTask: (task: Task) => void
}

function TaskRow({ task, onToggleTask, onEditTask, onViewTask }: TaskRowProps) {
  const completed = task.status === "DONE"
  const progress = getTaskProgress(task)
  const today = getTodayDate()
  const overdue = !completed && Boolean(task.dueDate) && task.dueDate < today
  const dateLabel = task.dueDate ? formatDate(task.dueDate, true) : "No due date"

  return (
    <div className="group flex min-w-0 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:px-5 motion-reduce:transition-none">
      <button
        type="button"
        onClick={() => onToggleTask(task.id)}
        aria-label={completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${completed ? "border-foreground bg-foreground text-background" : "border-muted-foreground/40 hover:border-foreground"}`}
      >
        {completed && <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />}
      </button>

      <div className="min-w-0 flex-1 self-center">
        <div className="flex min-w-0 items-center gap-2">
          <p className={`truncate text-sm font-medium ${completed ? "text-muted-foreground line-through" : ""}`}>{task.title}</p>
          <PriorityBadge priority={task.priority} />
        </div>
        {task.description && <p className="mt-1 line-clamp-1 max-w-2xl text-xs text-muted-foreground">{task.description}</p>}
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {task.projectName && <span className="max-w-40 truncate">{task.projectName}</span>}
          {task.assignedUserId !== null && task.assignedUserName && (
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">{getInitials(task.assignedUserName)}</span>
              <span className="truncate">{task.assignedUserName}</span>
            </span>
          )}
          {(task.projectName || (task.assignedUserId !== null && task.assignedUserName)) && <span className="size-0.5 shrink-0 rounded-full bg-muted-foreground/50" />}
          <StatusBadge status={task.status} />
          {(task.startDate || task.dueDate) && <span className={`inline-flex items-center gap-1 md:hidden ${overdue ? "font-medium text-destructive" : ""}`}>
            <CalendarDays className="size-3" aria-hidden="true" />
            {overdue ? "Overdue · " : ""}{task.startDate && <>{formatDate(task.startDate, false)} – </>}{task.dueDate ? formatDate(task.dueDate, false) : "No due date"}
          </span>}
        </div>
      </div>

      <div className={`hidden shrink-0 items-center gap-1.5 pt-1 text-xs md:flex ${overdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
        {overdue ? <TriangleAlert className="size-3" aria-hidden="true" /> : task.dueDate === today ? <Clock3 className="size-3" aria-hidden="true" /> : <CalendarDays className="size-3" aria-hidden="true" />}
        <span>
          {task.startDate && <span className="mr-1 text-muted-foreground">{formatDate(task.startDate, false)} –</span>}
          {overdue ? `Overdue · ${dateLabel}` : dateLabel}
        </span>
      </div>

      <div className="flex w-[104px] shrink-0 items-center gap-1.5 pt-1" aria-label={progress ? `Progress ${progress.percentage}%, ${progress.completed} of ${progress.total} subtasks complete` : "Progress not tracked"}>
        <TaskProgressBar value={progress?.percentage ?? null} className={progress ? "w-9" : "text-[9px]"} />
        {progress && <span className="w-7 text-right text-[10px] tabular-nums text-muted-foreground">{progress.percentage}%</span>}
      </div>

      <button type="button" onClick={() => onViewTask(task)} aria-label={`View progress and subtasks for ${task.title}`} className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        <ListTodo className="size-3.5" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => onEditTask(task)} aria-label={`Edit ${task.title}`} className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        <Pencil className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

function getTodayDate() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

function formatDate(value: string, withYear: boolean) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", ...(withYear ? { year: "numeric" as const } : {}) }).format(new Date(year, month - 1, day))
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

export default TaskRow

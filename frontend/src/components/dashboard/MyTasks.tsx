import { useMemo, useState } from "react"
import { Check, Circle, ListTodo, MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"
import * as m from "motion/react-m"

import { taskRepository } from "@/services/taskRepository"
import { getTaskProgress } from "@/services/taskProgress"
import useTasks from "@/hooks/useTasks"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { taskPriorityLabels, taskStatusLabels, type Task, type TaskStatusFilter } from "@/pages/MyWorkPage/types"
import TaskProgressBar from "@/pages/MyWorkPage/components/TaskProgressBar"

const taskFilters: TaskStatusFilter[] = ["All", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]

const statusTone = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-chart-2/10 text-chart-2",
  IN_REVIEW: "bg-chart-3/10 text-chart-3",
  DONE: "bg-chart-4/10 text-chart-4",
} as const

const priorityTone = {
  HIGH: "border-destructive/20 bg-destructive/10 text-destructive",
  MEDIUM: "border-chart-5/20 bg-chart-5/10 text-chart-5",
  LOW: "border-border bg-muted/60 text-muted-foreground",
} as const

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function dueLabel(task: Task) {
  if (!task.dueDate) return "No due date"
  const [year, month, day] = task.dueDate.split("-").map(Number)
  const due = new Date(year, month - 1, day)
  return `Due ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due)}`
}

function todayKey() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

function MyTasks() {
  const { tasks, ownerKey } = useTasks()
  const [filter, setFilter] = useState<TaskStatusFilter>("All")
  const counts = useMemo(() => ({
    All: tasks.length,
    TODO: tasks.filter((task) => task.status === "TODO").length,
    IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS").length,
    IN_REVIEW: tasks.filter((task) => task.status === "IN_REVIEW").length,
    DONE: tasks.filter((task) => task.status === "DONE").length,
  }), [tasks])
  const filteredTasks = [...tasks].filter((task) => filter === "All" || task.status === filter)
  const sorted = filteredTasks.sort((a, b) => {
    if (a.status === "DONE" && b.status !== "DONE") return 1
    if (b.status === "DONE" && a.status !== "DONE") return -1
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })
  const shown = sorted.slice(0, 5)
  const filterLabel = (status: TaskStatusFilter) => status === "All" ? "All" : taskStatusLabels[status]

  return (
    <section aria-labelledby="my-tasks-title" className="min-w-0 overflow-hidden rounded-md border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <div>
          <h2 id="my-tasks-title" className="text-sm font-semibold leading-tight">My tasks</h2>
          <p className="mt-1 text-[11px] leading-none text-muted-foreground">{tasks.filter((task) => task.status !== "DONE").length} open · {tasks.length} total</p>
        </div>
        <Link to="/work" className="rounded-sm text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View all</Link>
      </header>
      <div role="group" aria-label="Filter tasks by status" className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
        {taskFilters.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
            className={`shrink-0 rounded-full px-2 py-1.5 text-[10px] leading-none font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${filter === status ? "bg-primary text-primary-foreground" : "border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {filterLabel(status)} <span className="tabular-nums opacity-70">{counts[status]}</span>
          </button>
        ))}
      </div>
      {shown.length ? (
        <m.ul initial="hidden" animate="visible" variants={staggerContainer}>
          {shown.map((task) => {
            const done = task.status === "DONE"
            const progress = getTaskProgress(task)
            return (
              <m.li key={task.id} variants={staggerItem} className="group flex min-w-0 items-center gap-2 border-b border-border/70 px-3 py-2 last:border-b-0 transition-colors hover:bg-muted/25 motion-reduce:transition-none">
              <button type="button" onClick={() => taskRepository.toggleCompletion(ownerKey, task.id)} aria-label={`${done ? "Reopen" : "Complete"} ${task.title}`} aria-pressed={done} className={`inline-flex size-[15px] shrink-0 items-center justify-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/60 text-transparent hover:border-primary hover:text-primary"}`}>
                {done ? <Check className="size-2.5" aria-hidden="true" /> : <Circle className="size-2" aria-hidden="true" />}
              </button>
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 sm:grid-cols-[minmax(0,1fr)_68px_62px_42px_20px_42px]">
                <div className="min-w-0">
                  <Link to="/work" className={`block truncate text-xs font-medium leading-5 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</Link>
                  <div className="mt-1 flex min-w-0 items-center gap-1.5" aria-label={progress ? `Progress ${progress.percentage}%, ${progress.completed} of ${progress.total} subtasks complete` : "Progress not tracked"}>
                    <TaskProgressBar value={progress?.percentage ?? null} className={progress ? "h-1 w-10" : "text-[9px]"} />
                    {progress && <span className="truncate text-[9px] text-muted-foreground">{progress.completed}/{progress.total} subtasks · {progress.percentage}%</span>}
                  </div>
                </div>
                <span className="hidden min-w-0 truncate text-[10px] leading-none text-muted-foreground sm:block" title={task.projectName ?? undefined}>{task.projectName ?? "—"}</span>
                <span className={`justify-self-start rounded-full px-1.5 py-1 text-[10px] leading-none font-medium ${statusTone[task.status]}`}>{taskStatusLabels[task.status]}</span>
                <span className={`justify-self-end whitespace-nowrap text-[10px] leading-none tabular-nums text-muted-foreground sm:justify-self-start ${task.dueDate && task.dueDate < todayKey() && !done ? "font-semibold text-destructive" : ""}`}>{task.dueDate ? dueLabel(task).replace("Due ", "") : "—"}</span>
                <span className="hidden size-[18px] items-center justify-center rounded-full bg-primary/15 text-[7px] leading-none font-semibold text-primary sm:flex" title={task.assignedUserName ?? "Unassigned"} aria-label={`Assigned to ${task.assignedUserName ?? "nobody"}`}>{task.assignedUserName ? initials(task.assignedUserName) : "—"}</span>
                <span className="hidden items-center justify-end gap-1 sm:flex">
                  <span className={`rounded border px-1 py-0.5 text-[7px] leading-none font-medium ${priorityTone[task.priority]}`}>{taskPriorityLabels[task.priority]}</span>
                  <Link to="/work" aria-label={`More actions for ${task.title}`} className="inline-flex size-5 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                    <MoreHorizontal className="size-3" aria-hidden="true" />
                  </Link>
                </span>
                </div>
              </m.li>
            )
          })}
        </m.ul>
      ) : (
        <div className="flex min-h-24 flex-col items-center justify-center px-4 text-center">
          <ListTodo className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium">{tasks.length ? `No ${filterLabel(filter).toLocaleLowerCase()} tasks` : "No tasks yet"}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{tasks.length ? "Choose another status to see more tasks." : "Tasks created in My Work will show up here."}</p>
          <Link to="/work" className="mt-2 text-[10px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Go to My Work</Link>
        </div>
      )}
      {sorted.length > shown.length && <div className="border-t border-border px-3 py-1.5 text-right"><Link to="/work" className="text-[9px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">+{sorted.length - shown.length} more tasks</Link></div>}
    </section>
  )
}

export default MyTasks

import {
  CalendarDays,
  Check,
  Clock3,
  MoreHorizontal,
} from "lucide-react"

import type { Task } from "../types"
import PriorityBadge from "./PriorityBadge"
import StatusBadge from "./StatusBadge"

interface TaskRowProps {
  task: Task
  onToggleTask: (taskId: number) => void
}

function TaskRow({
  task,
  onToggleTask,
}: TaskRowProps) {
  const completed = task.status === "Done"

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/20 sm:px-5">
      <button
        type="button"
        onClick={() => onToggleTask(task.id)}
        aria-label={
          completed
            ? `Mark ${task.title} as incomplete`
            : `Mark ${task.title} as complete`
        }
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
          completed
            ? "border-foreground bg-foreground text-background"
            : "border-muted-foreground/40 hover:border-foreground",
        ].join(" ")}
      >
        {completed && (
          <Check
            className="size-3"
            strokeWidth={2.5}
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={[
              "truncate text-sm font-medium",
              completed &&
                "text-muted-foreground line-through",
            ].join(" ")}
          >
            {task.title}
          </p>

          <PriorityBadge priority={task.priority} />
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {task.project}
          </span>

          <span className="size-0.5 shrink-0 rounded-full bg-muted-foreground/50" />

          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        {task.dueLabel === "Today" ? (
          <Clock3 className="size-3" />
        ) : (
          <CalendarDays className="size-3" />
        )}

        <span>{task.dueDate}</span>
      </div>

      <button
        type="button"
        aria-label={`More options for ${task.title}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  )
}

export default TaskRow
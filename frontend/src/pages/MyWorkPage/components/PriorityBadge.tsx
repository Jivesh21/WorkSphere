import { taskPriorityLabels, type TaskPriority } from "../types"

interface PriorityBadgeProps {
  priority: TaskPriority
}

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: "bg-red-500/10 text-red-700 dark:text-red-300",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  LOW: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${priorityStyles[priority]}`}>
      {taskPriorityLabels[priority]}
    </span>
  )
}

export default PriorityBadge

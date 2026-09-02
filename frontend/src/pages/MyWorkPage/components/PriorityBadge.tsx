import type { TaskPriority } from "../types"

interface PriorityBadgeProps {
  priority: TaskPriority
}

const priorityStyles: Record<TaskPriority, string> = {
  High: "bg-red-500/10 text-red-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-emerald-500/10 text-emerald-400",
}

function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <span
      className={[
        "hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex",
        priorityStyles[priority],
      ].join(" ")}
    >
      {priority}
    </span>
  )
}

export default PriorityBadge
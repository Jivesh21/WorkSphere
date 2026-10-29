import { Check, Circle, Clock3, Eye } from "lucide-react"
import { taskStatusLabels, type TaskStatus } from "../types"

interface StatusBadgeProps {
  status: TaskStatus
}

const statusIcons = {
  TODO: Circle,
  IN_PROGRESS: Clock3,
  IN_REVIEW: Eye,
  DONE: Check,
} satisfies Record<TaskStatus, typeof Circle>

function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = statusIcons[status]
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-2.5" aria-hidden="true" />
      {taskStatusLabels[status]}
    </span>
  )
}

export default StatusBadge

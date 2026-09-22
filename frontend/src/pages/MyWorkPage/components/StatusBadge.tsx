import {
  Check,
  Circle,
  Clock3,
} from "lucide-react"

import type { TaskStatus } from "../types"

interface StatusBadgeProps {
  status: TaskStatus
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const Icon =
    status === "Done"
      ? Check
      : status === "In progress"
        ? Clock3
        : Circle

  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-2.5" />
      {status}
    </span>
  )
}

export default StatusBadge
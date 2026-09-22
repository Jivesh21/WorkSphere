import type { MemberStatus } from "../types"

interface StatusBadgeProps {
  status: MemberStatus
}

const statusStyles: Record<MemberStatus, string> = {
  Available:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Busy:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Away:
    "bg-muted text-muted-foreground",
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
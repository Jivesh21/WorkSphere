import type { MemberStatus } from "../types"

interface StatusDotProps {
  status: MemberStatus
}

const statusStyles: Record<MemberStatus, string> = {
  Available: "bg-emerald-500",
  Busy: "bg-amber-500",
  Away: "bg-muted-foreground",
}

function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${statusStyles[status]}`}
      title={status}
    />
  )
}

export default StatusDot
import { Mail, MoreHorizontal } from "lucide-react"
import type { TeamMember } from "../types"
import StatusBadge from "./StatusBadge"
import StatusDot from "./StatusDot"

interface MemberRowProps {
  member: TeamMember
  onRemove?: (memberId: string) => void
}

function MemberRow({
  member,
  onRemove,
}: MemberRowProps) {
  return (
    <div className="grid grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {member.initials}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot status={member.status} />

            <p className="truncate text-sm font-medium">
              {member.name}
            </p>
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">
              {member.email}
            </span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm">{member.role}</p>
      </div>

      <div>
        <StatusBadge status={member.status} />
      </div>

      <div>
        <p className="text-sm">
          {member.projects}
        </p>

        <p className="text-xs text-muted-foreground">
          projects
        </p>
      </div>

      <div>
        <p className="text-sm">
          {member.completedTasks}/{member.tasks}
        </p>

        <p className="text-xs text-muted-foreground">
          tasks
        </p>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Actions for ${member.name}`}
          onClick={() => onRemove?.(member.id)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default MemberRow
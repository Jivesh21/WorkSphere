import type { TeamMember } from "../types"
import EmptyState from "./EmptyState"
import MemberRow from "./MemberRow"

interface MemberListProps {
  members: TeamMember[]
  onRemove?: (memberId: string) => void
}

function MemberList({
  members,
  onRemove,
}: MemberListProps) {
  if (members.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Member</span>
        <span>Role</span>
        <span>Status</span>
        <span>Projects</span>
        <span>Tasks</span>
        <span />
      </div>

      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default MemberList
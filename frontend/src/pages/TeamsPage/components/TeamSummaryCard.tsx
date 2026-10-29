import type { LucideIcon } from "lucide-react"

interface TeamSummaryCardProps {
  label: string
  value: number
  icon: LucideIcon
  description: string
}

function TeamSummaryCard({
  label,
  value,
  icon: Icon,
  description,
}: TeamSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export default TeamSummaryCard

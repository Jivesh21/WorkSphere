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
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-muted p-2.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export default TeamSummaryCard
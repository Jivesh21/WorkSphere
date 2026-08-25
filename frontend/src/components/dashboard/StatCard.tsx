import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  description: string
  trend?: string
  icon: LucideIcon
  iconClassName?: string
}

function StatCard({
  label,
  value,
  description,
  trend,
  icon: Icon,
  iconClassName = "",
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.035]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">
          {label}
        </p>

        <div
          className={[
            "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.045]",
            iconClassName,
          ].join(" ")}
        >
          <Icon className="size-[17px]" strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[30px] font-semibold tracking-[-0.04em] text-foreground">
          {value}
        </p>

        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {trend && (
            <span className="inline-flex items-center gap-0.5 font-medium text-emerald-400">
              <ArrowUpRight className="size-3" />
              {trend}
            </span>
          )}

          <span className="text-muted-foreground">
            {description}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatCard
import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  description: string
  trend?: string
  trendDirection?: "up" | "down"
  icon: LucideIcon
  iconClassName?: string
}

function StatCard({
  label,
  value,
  description,
  trend,
  trendDirection = "up",
  icon: Icon,
  iconClassName = "",
}: StatCardProps) {
  const isPositive = trendDirection === "up"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.025]">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium text-muted-foreground">
          {label}
        </p>

        <div
          className={[
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            "bg-white/[0.045] ring-1 ring-inset ring-white/[0.05]",
            iconClassName,
          ].join(" ")}
        >
          <Icon
            className="size-[17px]"
            strokeWidth={1.8}
          />
        </div>
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-[30px] font-semibold leading-none tracking-[-0.045em]">
          {value}
        </p>

        {/* Meta */}
        <div className="mt-3 flex min-h-4 items-center gap-2 text-[11px]">
          {trend && (
            <span
              className={[
                "inline-flex items-center gap-0.5 font-semibold",
                isPositive
                  ? "text-emerald-400"
                  : "text-red-400",
              ].join(" ")}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}

              {trend}
            </span>
          )}

          <span className="truncate text-muted-foreground">
            {description}
          </span>
        </div>
      </div>

      {/* Subtle hover accent */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
    </div>
  )
}

export default StatCard
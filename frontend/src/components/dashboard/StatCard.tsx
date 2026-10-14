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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111113] p-5 transition-all duration-200 hover:border-white/15 hover:bg-white/3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium text-[#9A9AA2] tracking-wide uppercase">
          {label}
        </p>

        <div
          className={[
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            "bg-white/5 ring-1 ring-inset ring-white/5",
            iconClassName,
          ].join(" ")}
        >
          <Icon
            className="size-[18px]"
            strokeWidth={1.8}
          />
        </div>
      </div>

      {/* Value */}
      <div className="mt-5">
        <p className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-[#F4F4F6]">
          {value}
        </p>

        {/* Meta */}
        <div className="mt-3.5 flex min-h-4 items-center gap-2 text-[11px]">
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

          <span className="truncate text-[#9A9AA2]">
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
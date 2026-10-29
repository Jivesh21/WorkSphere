import { useEffect } from "react"
import type { LucideIcon } from "lucide-react"
import { animate, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import * as m from "motion/react-m"

interface StatCardProps {
  label: string
  value: string
  description: string
  icon: LucideIcon
  chartValues?: number[]
  color?: "violet" | "blue" | "green" | "rose"
}

const colorStyles = {
  violet: { icon: "bg-violet-500/15 text-violet-400", bar: "text-violet-400" },
  blue: { icon: "bg-blue-500/15 text-blue-400", bar: "text-blue-400" },
  green: { icon: "bg-emerald-500/15 text-emerald-400", bar: "text-emerald-400" },
  rose: { icon: "bg-rose-500/15 text-rose-400", bar: "text-rose-400" },
} as const

function StatCard({ label, value, description, icon: Icon, chartValues, color = "violet" }: StatCardProps) {
  const unavailable = value === "--"
  const numericValue = /^-?\d+$/.test(value) ? Number(value) : null
  const bars = chartValues?.filter((item) => Number.isFinite(item) && item >= 0) ?? []
  const maxBar = Math.max(...bars, 0)
  const styles = colorStyles[color]

  return (
    <article className="group relative flex min-h-[84px] min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border border-border/80 bg-card px-3.5 py-3 shadow-sm shadow-black/[0.025] transition-[border-color,background-color,box-shadow] duration-150 hover:border-primary/25 hover:shadow-black/5 focus-within:border-primary/35 motion-reduce:transition-none">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ${styles.icon}`}>
          <Icon className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className={`mt-1 truncate font-semibold leading-none tracking-tight text-card-foreground ${unavailable ? "text-[10px] text-muted-foreground" : "text-xl tabular-nums"}`}>
            {unavailable ? "Not connected" : numericValue !== null && Number.isSafeInteger(numericValue) ? <AnimatedMetricValue value={numericValue} /> : value}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {maxBar > 0 && (
        <div
          aria-label={`${label} distribution: ${bars.join(", ")}`}
          role="img"
          className={`flex h-8 shrink-0 items-end gap-[3px] ${styles.bar}`}
        >
          {bars.map((bar, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="w-[4px] rounded-t-[2px] bg-current opacity-90"
              style={{ height: `${Math.max(2, Math.round((bar / maxBar) * 28))}px` }}
            />
          ))}
        </div>
      )}
    </article>
  )
}

function AnimatedMetricValue({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion()
  const count = useMotionValue(0)
  const formattedCount = useTransform(count, (latest) => Math.round(latest).toLocaleString())

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(value)
      return
    }

    const animation = animate(count, value, { duration: 0.65, ease: "easeOut" })
    return () => animation.stop()
  }, [count, shouldReduceMotion, value])

  return (
    <>
      <span className="sr-only">{value.toLocaleString()}</span>
      <m.span aria-hidden="true">{shouldReduceMotion ? value.toLocaleString() : formattedCount}</m.span>
    </>
  )
}

export default StatCard

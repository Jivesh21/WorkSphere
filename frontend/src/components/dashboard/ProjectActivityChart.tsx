import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const activityData = [
  { day: "Mon", completed: 12, issues: 4 },
  { day: "Tue", completed: 18, issues: 3 },
  { day: "Wed", completed: 14, issues: 6 },
  { day: "Thu", completed: 24, issues: 4 },
  { day: "Fri", completed: 21, issues: 2 },
  { day: "Sat", completed: 28, issues: 3 },
  { day: "Sun", completed: 32, issues: 1 },
]

function ProjectActivityChart() {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pb-2 pt-5">
        <div>
          <h2 className="text-sm font-semibold">
            Project activity
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tasks completed across your workspace
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-cyan-400" />
            Completed
          </div>

          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-red-400" />
            Issues
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full px-2 pb-4 pt-4 sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={activityData}
            margin={{
              top: 10,
              right: 16,
              left: -18,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.07)"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.38)",
                fontSize: 11,
              }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.28)",
                fontSize: 10,
              }}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.12)",
              }}
              contentStyle={{
                background: "#171717",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "12px",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.55)",
                marginBottom: "4px",
              }}
            />

            <Line
              type="monotone"
              dataKey="completed"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 0,
              }}
            />

            <Line
              type="monotone"
              dataKey="issues"
              stroke="#f87171"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{
                r: 3,
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default ProjectActivityChart
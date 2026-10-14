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
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113]">
      {/* Header */}
      <div className="flex flex-col gap-2.5 px-5 pb-1 pt-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F4F4F6]">
            Project Activity
          </h2>

          <p className="mt-1 text-xs text-[#9A9AA2]">
            Tasks completed across your workspace
          </p>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-[#9A9AA2]">
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
      <div className="h-[250px] w-full px-3 pb-5 pt-2">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={activityData}
            margin={{
              top: 8,
              right: 16,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              horizontalCoordinatesGenerator={({ height }) => {
                const lines: number[] = []
                for (let i = 1; i <= 4; i++) {
                  lines.push((height / 4) * i)
                }
                return lines
              }}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.5}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 10.5,
                fontWeight: 500,
              }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.25)",
                fontSize: 10,
              }}
              width={36}
              tickCount={4}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.08)",
                strokeWidth: 1,
              }}
              contentStyle={{
                background: "#111113",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#F4F4F6",
                fontSize: "11.5px",
                padding: "9px 12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
              labelStyle={{
                color: "#9A9AA2",
                marginBottom: "5px",
                fontSize: "10.5px",
                fontWeight: 500,
              }}
              
            />

            <Line
              type="monotone"
              dataKey="completed"
              stroke="#22d3ee"
              strokeWidth={2.2}
              dot={false}
              activeDot={{
                r: 4.5,
                strokeWidth: 0,
                fill: "#22d3ee",
              }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <Line
              type="monotone"
              dataKey="issues"
              stroke="#f87171"
              strokeWidth={1.6}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{
                r: 3.5,
                strokeWidth: 0,
                fill: "#f87171",
              }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default ProjectActivityChart
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Link } from "react-router-dom"
import { ChartNoAxesCombined } from "lucide-react"

import type { TaskStatus } from "@/pages/MyWorkPage/types"
import { taskStatusLabels } from "@/pages/MyWorkPage/types"
import useTasks from "@/hooks/useTasks"

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
const colors: Record<TaskStatus, string> = {
  TODO: "var(--chart-1)",
  IN_PROGRESS: "var(--chart-2)",
  IN_REVIEW: "var(--chart-3)",
  DONE: "var(--chart-4)",
}

function TaskStatusChart() {
  const { tasks } = useTasks()
  const total = tasks.length
  const data = statuses.map((status) => ({
    status,
    name: taskStatusLabels[status],
    value: tasks.filter((task) => task.status === status).length,
  })).filter((item) => item.value > 0)

  return (
    <section aria-labelledby="task-status-title" className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div>
          <h2 id="task-status-title" className="text-sm font-semibold tracking-tight">Task status</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Current distribution <span aria-hidden="true">·</span> session only</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-muted/50 text-muted-foreground"><ChartNoAxesCombined className="size-3.5" aria-hidden="true" /></span>
      </header>
      {data.length ? (
        <div className="grid min-h-48 grid-cols-1 items-center gap-4 p-4 sm:grid-cols-[minmax(145px,0.8fr)_1fr]">
          <div className="relative h-40 min-w-0" role="img" aria-label={`Task status chart: ${data.map(({ name, value }) => `${name} ${value}`).join(", ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="88%" paddingAngle={3} stroke="none" isAnimationActive={false}>
                  {data.map(({ status }) => <Cell key={status} fill={colors[status]} />)}
                </Pie>
                <Tooltip
                  cursor={false}
                  contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 8, boxShadow: "0 10px 30px rgb(0 0 0 / 18%)", color: "var(--popover-foreground)", fontSize: 12 }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                  formatter={(value) => [`${value} ${Number(value) === 1 ? "task" : "tasks"}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold leading-none tabular-nums tracking-tight">{total}</span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Tasks</span>
            </div>
          </div>
          <ul className="space-y-3">
            {statuses.map((status) => {
              const count = tasks.filter((task) => task.status === status).length
              const share = total ? Math.round((count / total) * 100) : 0
              return (
                <li key={status} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: colors[status] }} />{taskStatusLabels[status]}</span>
                    <span className="shrink-0 font-medium tabular-nums text-foreground">{count}<span className="ml-1 text-[9px] font-normal text-muted-foreground">{share}%</span></span>
                  </div>
                  <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${share}%`, backgroundColor: colors[status] }} /></div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-medium">No task data yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">Tasks you add in My Work will appear here.</p>
          <Link className="mt-3 text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" to="/work">Open My Work</Link>
        </div>
      )}
    </section>
  )
}

export default TaskStatusChart

import { ArrowUpRight, MoreHorizontal } from "lucide-react"

interface Project {
  name: string
  code: string
  color: string
  completedTasks: number
  totalTasks: number
  health: "On track" | "At risk"
  progress: number
  dueDate: string
}

const projects: Project[] = [
  {
    name: "Atlas Mobile",
    code: "ATL",
    color: "bg-sky-500",
    completedTasks: 38,
    totalTasks: 52,
    health: "On track",
    progress: 72,
    dueDate: "Apr 18",
  },
  {
    name: "Nimbus API",
    code: "NIM",
    color: "bg-violet-500",
    completedTasks: 24,
    totalTasks: 50,
    health: "At risk",
    progress: 48,
    dueDate: "Apr 09",
  },
  {
    name: "Mercury Web",
    code: "MER",
    color: "bg-amber-500",
    completedTasks: 61,
    totalTasks: 71,
    health: "On track",
    progress: 86,
    dueDate: "Mar 29",
  },
]

function ActiveProjects() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Active Projects</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Current project progress
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1.5fr_0.9fr_1fr_0.6fr] border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span>Project</span>
          <span>Health</span>
          <span>Progress</span>
          <span className="text-right">Due</span>
        </div>

        <div className="divide-y divide-border">
          {projects.map((project) => (
            <ProjectRow key={project.code} project={project} />
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {projects.map((project) => (
          <div key={project.code} className="space-y-4 p-5">
            <div className="flex items-start justify-between">
              <ProjectIdentity project={project} />

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`More options for ${project.name}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <HealthBadge health={project.health} />

              <span className="text-xs text-muted-foreground">
                Due {project.dueDate}
              </span>
            </div>

            <ProgressBar progress={project.progress} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-[1.5fr_0.9fr_1fr_0.6fr] items-center px-5 py-4 transition hover:bg-muted/40">
      <ProjectIdentity project={project} />

      <HealthBadge health={project.health} />

      <div className="flex items-center gap-3 pr-5">
        <ProgressBar progress={project.progress} />
        <span className="w-8 text-right text-xs font-medium">
          {project.progress}%
        </span>
      </div>

      <span className="text-right text-xs text-muted-foreground">
        {project.dueDate}
      </span>
    </div>
  )
}

function ProjectIdentity({ project }: { project: Project }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white ${project.color}`}
      >
        {project.code}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{project.name}</p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {project.completedTasks} / {project.totalTasks} tasks
        </p>
      </div>
    </div>
  )
}

function HealthBadge({
  health,
}: {
  health: Project["health"]
}) {
  const isHealthy = health === "On track"

  return (
    <span
      className={[
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        isHealthy
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          isHealthy ? "bg-emerald-500" : "bg-amber-500",
        ].join(" ")}
      />

      {health}
    </span>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-foreground transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ActiveProjects
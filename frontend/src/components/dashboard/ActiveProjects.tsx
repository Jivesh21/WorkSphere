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
          <h2 className="text-sm font-semibold tracking-tight">
            Active Projects
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Current project progress
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {/* Table header */}
        <div className="grid grid-cols-[1.55fr_0.9fr_1.15fr_0.55fr] border-b border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span>Project</span>
          <span>Health</span>
          <span>Progress</span>
          <span className="text-right">Due</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {projects.map((project) => (
            <ProjectRow key={project.code} project={project} />
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {projects.map((project) => (
          <div
            key={project.code}
            className="space-y-4 p-4 transition-colors hover:bg-muted/20"
          >
            <div className="flex items-start justify-between gap-3">
              <ProjectIdentity project={project} />

              <button
                type="button"
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`More options for ${project.name}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
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
    <div className="group grid grid-cols-[1.55fr_0.9fr_1.15fr_0.55fr] items-center px-5 py-3.5 transition-colors hover:bg-muted/20">
      {/* Project */}
      <ProjectIdentity project={project} />

      {/* Health */}
      <HealthBadge health={project.health} />

      {/* Progress */}
      <div className="flex items-center gap-3 pr-6">
        <ProgressBar progress={project.progress} />

        <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
          {project.progress}%
        </span>
      </div>

      {/* Due date */}
      <span className="text-right text-xs tabular-nums text-muted-foreground">
        {project.dueDate}
      </span>
    </div>
  )
}

function ProjectIdentity({ project }: { project: Project }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {/* Project code */}
      <div
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          "text-[10px] font-bold text-white shadow-sm",
          project.color,
        ].join(" ")}
      >
        {project.code}
      </div>

      {/* Project information */}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold tracking-tight">
          {project.name}
        </p>

        <p className="mt-0.5 text-[11px] text-muted-foreground">
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
        "inline-flex w-fit items-center gap-1.5 rounded-full",
        "px-2.5 py-1 text-[10px] font-medium",
        isHealthy
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-amber-500/10 text-amber-400",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          isHealthy ? "bg-emerald-400" : "bg-amber-400",
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
        className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ActiveProjects
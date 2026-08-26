import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react"

import DashboardLayout from "@/components/layout/DashboardLayout"

type ProjectStatus = "Active" | "Planning" | "Completed"
type ProjectHealth = "On track" | "At risk"

interface Project {
  id: number
  name: string
  code: string
  description: string
  color: string
  status: ProjectStatus
  health: ProjectHealth
  progress: number
  completedTasks: number
  totalTasks: number
  members: number
  dueDate: string
}

const initialProjects: Project[] = [
  {
    id: 1,
    name: "WorkSphere",
    code: "WS",
    description:
      "Team collaboration and project management platform",
    color: "bg-cyan-500",
    status: "Active",
    health: "On track",
    progress: 64,
    completedTasks: 42,
    totalTasks: 66,
    members: 3,
    dueDate: "Sep 18",
  },
  {
    id: 2,
    name: "Atlas Mobile",
    code: "ATL",
    description:
      "Mobile experience and application redesign",
    color: "bg-sky-500",
    status: "Active",
    health: "On track",
    progress: 72,
    completedTasks: 38,
    totalTasks: 52,
    members: 6,
    dueDate: "Sep 04",
  },
  {
    id: 3,
    name: "Nimbus API",
    code: "NIM",
    description:
      "Backend services and public API infrastructure",
    color: "bg-violet-500",
    status: "Active",
    health: "At risk",
    progress: 48,
    completedTasks: 24,
    totalTasks: 50,
    members: 5,
    dueDate: "Aug 30",
  },
  {
    id: 4,
    name: "Mercury Web",
    code: "MER",
    description:
      "Marketing website and customer-facing experience",
    color: "bg-amber-500",
    status: "Planning",
    health: "On track",
    progress: 18,
    completedTasks: 7,
    totalTasks: 38,
    members: 4,
    dueDate: "Oct 12",
  },
  {
    id: 5,
    name: "Orion Analytics",
    code: "ORI",
    description:
      "Analytics and reporting workspace",
    color: "bg-emerald-500",
    status: "Completed",
    health: "On track",
    progress: 100,
    completedTasks: 84,
    totalTasks: 84,
    members: 7,
    dueDate: "Aug 12",
  },
]

const statusFilters = [
  "All",
  "Active",
  "Planning",
  "Completed",
] as const

type StatusFilter = (typeof statusFilters)[number]

function ProjectsPage() {
  const [projectList] =
    useState<Project[]>(initialProjects)

  const [search, setSearch] = useState("")

  const [activeStatus, setActiveStatus] =
    useState<StatusFilter>("All")

  const [showStatusMenu, setShowStatusMenu] =
    useState(false)

  const visibleProjects = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return projectList.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        project.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        project.code
          .toLowerCase()
          .includes(normalizedSearch) ||
        project.description
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        activeStatus === "All" ||
        project.status === activeStatus

      return matchesSearch && matchesStatus
    })
  }, [projectList, search, activeStatus])

  const activeProjects = projectList.filter(
    (project) => project.status === "Active",
  ).length

  const teamMembers = projectList.reduce(
    (total, project) => total + project.members,
    0,
  )

  const dueSoon = projectList.filter(
    (project) =>
      project.status !== "Completed" &&
      ["Aug 30", "Sep 04"].includes(
        project.dueDate,
      ),
  ).length

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Workspace
            </p>

            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
              Projects
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage projects, progress, teams, and deadlines.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="size-4" />
            New project
          </button>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            icon={FolderKanban}
            label="Total projects"
            value={String(projectList.length)}
            description="across workspace"
          />

          <SummaryCard
            icon={FolderKanban}
            label="Active"
            value={String(activeProjects)}
            description="currently in progress"
          />

          <SummaryCard
            icon={Users}
            label="Team members"
            value={String(teamMembers)}
            description="across all projects"
          />

          <SummaryCard
            icon={CalendarDays}
            label="Due soon"
            value={String(dueSoon)}
            description="within 7 days"
          />
        </section>

        {/* Project workspace */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search projects..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            {/* Status dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowStatusMenu(
                    (current) => !current,
                  )
                }
                className={[
                  "inline-flex h-10 w-fit items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                  activeStatus !== "All"
                    ? "border-foreground/30 bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                Status
                <ChevronDown className="size-3.5" />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl">
                  <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Project status
                  </p>

                  {statusFilters.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setActiveStatus(status)
                        setShowStatusMenu(false)
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition",
                        activeStatus === status
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {status}

                      {activeStatus === status && (
                        <Check className="size-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status tabs */}
          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max items-center gap-1 px-4">
              {statusFilters.map((status) => {
                const isActive =
                  activeStatus === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setActiveStatus(status)
                    }
                    className={[
                      "relative px-3 py-3 text-xs font-medium transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {status}

                    {isActive && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Projects */}
          {visibleProjects.length > 0 ? (
            <div className="grid gap-3 p-4 lg:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <EmptyState search={search} />
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof FolderKanban
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function ProjectCard({
  project,
}: {
  project: Project
}) {
  const isHealthy = project.health === "On track"

  return (
    <article className="group rounded-2xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={[
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              "text-[10px] font-bold text-white shadow-sm",
              project.color,
            ].join(" ")}
          >
            {project.code}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight">
              {project.name}
            </h2>

            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {project.status}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={`More options for ${project.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 min-h-8 text-xs leading-5 text-muted-foreground">
        {project.description}
      </p>

      {/* Health */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            "text-[10px] font-medium",
            isHealthy
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400",
          ].join(" ")}
        >
          <span
            className={[
              "size-1.5 rounded-full",
              isHealthy
                ? "bg-emerald-400"
                : "bg-amber-400",
            ].join(" ")}
          />

          {project.health}
        </span>

        <span className="text-[11px] text-muted-foreground">
          {project.completedTasks}/{project.totalTasks} tasks
        </span>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Progress</span>

          <span className="font-medium text-foreground">
            {project.progress}%
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-500"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="size-3" />
          {project.members} members
        </div>

        <div className="flex items-center gap-1.5">
          <CalendarDays className="size-3" />
          {project.dueDate}
        </div>
      </div>

      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View project
        <ArrowUpRight className="size-3" />
      </button>
    </article>
  )
}

function EmptyState({
  search,
}: {
  search: string
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-sm font-medium">
        No projects found
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {search
          ? `No projects match "${search}".`
          : "There are no projects in this category."}
      </p>
    </div>
  )
}

export default ProjectsPage
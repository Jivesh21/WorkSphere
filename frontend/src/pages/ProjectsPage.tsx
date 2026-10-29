import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { CalendarDays, FolderKanban, Info, LayoutGrid, List, Pencil, Plus, Search, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import * as m from "motion/react-m"

import CreateProjectModal from "@/components/projects/CreateProjectModal"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { projectAccentOptions, projectIconOptions, type Project, type ProjectStatus } from "@/constants/projects"
import { cardHover } from "@/lib/motion"
import useProjects from "@/hooks/useProjects"

const statusFilters: Array<"All" | ProjectStatus> = ["All", "Active", "Planning", "Completed"]
type ProjectView = "grid" | "list"

const projectStatusTone: Record<ProjectStatus, string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Planning: "bg-chart-5/10 text-chart-5",
  Completed: "bg-chart-4/10 text-chart-4",
}

const projectStatusDot: Record<ProjectStatus, string> = {
  Active: "bg-chart-2",
  Planning: "bg-chart-5",
  Completed: "bg-chart-4",
}

function ProjectsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects: projectList, setProjects: setProjectList } = useProjects()
  const [search, setSearch] = useState("")
  const [activeStatus, setActiveStatus] = useState<(typeof statusFilters)[number]>("All")
  const [view, setView] = useState<ProjectView>("grid")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [creationNotice, setCreationNotice] = useState("")
  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false)
    setEditingProject(null)
  }, [])

  useEffect(() => {
    if ((location.state as { quickCreate?: string } | null)?.quickCreate !== "project") return
    setEditingProject(null)
    setShowCreateModal(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  const visibleProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return projectList.filter((project) => {
      const matchesSearch = normalizedSearch.length === 0
        || project.name.toLocaleLowerCase().includes(normalizedSearch)
        || project.code.toLocaleLowerCase().includes(normalizedSearch)
      return matchesSearch && (activeStatus === "All" || project.status === activeStatus)
    })
  }, [projectList, search, activeStatus])

  function handleCreateProject(project: Project): string | undefined {
    if (projectList.some((item) => item.code.toLowerCase() === project.code.toLowerCase())) {
      return `A project with code ${project.code} already exists.`
    }
    setProjectList((currentProjects) => [project, ...currentProjects])
    setSearch("")
    setActiveStatus("All")
    setCreationNotice(`${project.name} was created in this session.`)
    setShowCreateModal(false)
    return undefined
  }

  function handleUpdateProject(project: Project): string | undefined {
    if (projectList.some((item) => item.id !== project.id && item.code.toLowerCase() === project.code.toLowerCase())) {
      return `A project with code ${project.code} already exists.`
    }
    setProjectList((currentProjects) => currentProjects.map((item) => item.id === project.id ? project : item))
    setSearch("")
    setActiveStatus("All")
    setCreationNotice(`${project.name} was updated in this session.`)
    closeCreateModal()
    return undefined
  }

  function openCreateProject() {
    setEditingProject(null)
    setShowCreateModal(true)
  }

  function openEditProject(project: Project) {
    setEditingProject(project)
    setShowCreateModal(true)
  }

  const hasActiveFilters = search.trim().length > 0 || activeStatus !== "All"

  function clearFilters() {
    setSearch("")
    setActiveStatus("All")
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-4 pb-8">
        <header className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">Projects</h1>
              <span className="rounded-md border border-border/80 bg-card px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {projectList.length} {projectList.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Organize initiatives and keep project details in one place.</p>
          </div>
          <button
            type="button"
            onClick={openCreateProject}
            className="inline-flex h-9 w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground outline-none transition-[opacity,box-shadow] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <Plus className="size-3.5" aria-hidden="true" /> Create project
          </button>
        </header>

        <p className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3.5 py-3 text-xs font-semibold leading-5 text-foreground sm:text-sm">
          <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Projects are held in this page session and are not saved to an account or backend.
        </p>

        {creationNotice && (
          <p role="status" className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
            {creationNotice}
            <button type="button" onClick={() => setCreationNotice("")} className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Dismiss</button>
          </p>
        )}

        <section aria-label="Project list" className="space-y-3">
          <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border/80 bg-card p-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <label htmlFor="project-search" className="sr-only">Search projects by name or code</label>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="project-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear project search" className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" role="group" aria-label="Filter projects by status">
              {statusFilters.map((status) => {
                const count = status === "All" ? projectList.length : projectList.filter((project) => project.status === status).length
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={activeStatus === status}
                    onClick={() => setActiveStatus(status)}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${activeStatus === status ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    {status}<span className={`ml-1.5 tabular-nums ${activeStatus === status ? "text-primary/70" : "text-muted-foreground/70"}`}>{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex shrink-0 items-center gap-0.5 self-end rounded-md border border-border/70 bg-background p-0.5 sm:self-auto" role="group" aria-label="Project view">
              <button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={`inline-flex size-7 items-center justify-center rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="size-3.5" aria-hidden="true" />
              </button>
              <button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")} className={`inline-flex size-7 items-center justify-center rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {visibleProjects.length > 0 ? (
            <div className={view === "grid" ? "grid min-w-0 auto-rows-fr gap-3 sm:grid-cols-2 2xl:grid-cols-3" : "grid min-w-0 grid-cols-1 gap-2"}>
              {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} view={view} onEdit={openEditProject} />)}
            </div>
          ) : projectList.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create a project to start organizing related work."
              action={(
                <button type="button" onClick={openCreateProject} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[10px] font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
                  <Plus className="size-3" aria-hidden="true" /> Create project
                </button>
              )}
            />
          ) : search.trim() && activeStatus !== "All" ? (
            <EmptyState title="No projects match these filters" description="No project matches this search and status. Clear the filters to see your projects." action={<button type="button" onClick={clearFilters} className="mt-3 rounded-md px-3 py-1.5 text-[10px] font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>} />
          ) : activeStatus !== "All" ? (
            <EmptyState title={`No ${activeStatus.toLowerCase()} projects`} description="There are no projects with this status yet." action={<button type="button" onClick={() => setActiveStatus("All")} className="mt-3 rounded-md px-3 py-1.5 text-[10px] font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Show all projects</button>} />
          ) : search.trim() ? (
            <EmptyState title="No projects match your search" description="Try a different project name or code." action={<button type="button" onClick={() => setSearch("")} className="mt-3 rounded-md px-3 py-1.5 text-[10px] font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Clear search</button>} />
          ) : (
            <EmptyState
              title="No matching projects"
              description="Try another name or code, or clear the current filters."
              action={hasActiveFilters ? (
                <button type="button" onClick={clearFilters} className="mt-3 rounded-md px-3 py-1.5 text-[10px] font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button>
              ) : null}
            />
          )}
        </section>
      </div>

      <CreateProjectModal open={showCreateModal} onClose={closeCreateModal} onCreate={handleCreateProject} onUpdate={handleUpdateProject} initialProject={editingProject} />
    </DashboardLayout>
  )
}

function ProjectCard({ project, view, onEdit }: { project: Project; view: ProjectView; onEdit: (project: Project) => void }) {
  const projectIcon = projectIconOptions.find((option) => option.id === project.icon) ?? projectIconOptions[0]
  const projectAccent = projectAccentOptions.find((option) => option.id === project.accent) ?? projectAccentOptions[0]
  const ProjectIcon = projectIcon.Icon

  return (
    <m.article
      {...cardHover}
      className={`group relative isolate min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm shadow-black/[0.025] transition-[border-color,box-shadow,background-color] hover:border-primary/35 hover:shadow-md hover:shadow-black/[0.06] focus-within:border-primary/40 motion-reduce:transition-none ${view === "grid" ? "flex h-full min-h-[160px] flex-col" : "flex items-stretch"}`}
    >
      <span aria-hidden="true" className={`pointer-events-none absolute ${view === "grid" ? "inset-x-0 top-0 h-0.5" : "inset-y-0 left-0 w-0.5"} ${projectAccent.swatch}`} />
      <div className={`relative flex w-full min-w-0 flex-1 gap-3 p-3.5 ${view === "grid" ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between sm:pl-4"}`}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 ${projectAccent.iconBackground} ${projectAccent.icon}`}>
            <ProjectIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight text-card-foreground">{project.name}</h2>
              <span className="rounded border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground">{project.code}</span>
            </div>
            {project.description && <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{project.description}</p>}
          </div>
        </div>

        <div className={`flex min-w-0 flex-wrap items-center gap-1.5 ${view === "grid" ? "mt-auto border-t border-border/70 pt-3" : "sm:ml-4 sm:shrink-0"}`}>
          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[9px] font-medium ${projectStatusTone[project.status]}`}>
            <span className={`size-1.5 rounded-full ${projectStatusDot[project.status]}`} aria-hidden="true" />{project.status}
          </span>
          {project.health && <span className={`rounded border px-2 py-1 text-[9px] font-medium ${project.health === "At risk" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-chart-4/20 bg-chart-4/10 text-chart-4"}`}>{project.health}</span>}
          {project.dueDate && (
            <span className="inline-flex items-center gap-1 rounded border border-border/70 bg-muted/20 px-2 py-1 text-[9px] text-muted-foreground">
              <CalendarDays className="size-3" aria-hidden="true" /> Due {formatDueDate(project.dueDate)}
            </span>
          )}
          <button type="button" onClick={() => onEdit(project)} aria-label={`Edit ${project.name}`} className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:ml-1">
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </m.article>
  )
}

function formatDueDate(value: string) {
  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(parsedDate)
}

function EmptyState({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center px-4 py-7 text-center">
      <span className="mb-2.5 flex size-9 items-center justify-center rounded-lg border border-border/70 bg-card text-muted-foreground">
        <FolderKanban className="size-4" aria-hidden="true" />
      </span>
      <p className="text-xs font-semibold tracking-tight">{title}</p>
      <p className="mt-1 max-w-sm text-[10px] leading-4 text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

export default ProjectsPage

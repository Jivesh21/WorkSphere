import { FolderKanban } from "lucide-react"
import { Link } from "react-router-dom"

import { projectAccentOptions, projectIconOptions } from "@/constants/projects"
import useProjects from "@/hooks/useProjects"
import useTasks from "@/hooks/useTasks"
import { getProjectProgress } from "@/services/taskProgress"

function ActiveProjects() {
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const activeProjects = projects.filter((project) => project.status === "Active")

  return (
    <section aria-labelledby="active-projects-title" className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <div>
          <h2 id="active-projects-title" className="text-sm font-semibold tracking-tight">Project progress</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {activeProjects.length} active · session only
          </p>
        </div>
        <Link to="/projects" className="rounded-sm text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View all</Link>
      </header>
      {activeProjects.length ? (
        <ul className="divide-y divide-border">
          {activeProjects.slice(0, 6).map((project) => {
            const iconOption = projectIconOptions.find((option) => option.id === project.icon) ?? projectIconOptions[0]
            const accentOption = projectAccentOptions.find((option) => option.id === project.accent) ?? projectAccentOptions[0]
            const Icon = iconOption.Icon
            const projectTasks = tasks.filter((task) => task.projectId === project.id)
            const taskProgress = getProjectProgress(projectTasks)
            const progress = taskProgress?.percentage ?? null
            return (
              <li key={project.id} className="px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded ${accentOption.iconBackground} ${accentOption.icon}`}>
                    <Icon className="size-3" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs leading-none font-medium">{project.name}</span>
                  <span className="shrink-0 text-[10px] leading-none tabular-nums text-muted-foreground">
                    {progress === null ? "—" : `${progress}%`}
                  </span>
                </div>
                <div className="mt-1.5 pl-7">
                  {progress === null ? (
                    <p className="text-[10px] leading-none text-muted-foreground">Progress unavailable</p>
                  ) : (
                    <div
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-valuetext={taskProgress
                        ? `${taskProgress.completed} of ${taskProgress.total} subtasks complete across ${projectTasks.filter((task) => task.subtasks.length > 0).length} tasks`
                        : `${progress}% project progress`}
                      className="h-1 overflow-hidden rounded-full bg-muted"
                    >
                      <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center px-4 py-5 text-center">
          <FolderKanban className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium">No active projects</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Create a project to track it here.</p>
          <Link to="/projects" className="mt-2 text-[10px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Open projects</Link>
        </div>
      )}
      {activeProjects.length > 6 && (
        <div className="border-t border-border px-3.5 py-2 text-right">
          <Link to="/projects" className="text-[10px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            +{activeProjects.length - 6} more
          </Link>
        </div>
      )}
    </section>
  )
}

export default ActiveProjects

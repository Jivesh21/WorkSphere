import { useEffect, useMemo, useState, type ReactNode } from "react"

import { initialProjects, type Project } from "@/constants/projects"
import { ProjectsContext } from "@/contexts/ProjectsContext"
import useAuth from "@/hooks/useAuth"
import { projectApi } from "@/services/workspaceApi"
import useWorkspace from "@/contexts/WorkspaceContext"

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { isDevelopmentPreview } = useAuth()
  return (
    <ProjectsSession key={isDevelopmentPreview ? "preview" : "account"} preview={isDevelopmentPreview}>
      {children}
    </ProjectsSession>
  )
}

function ProjectsSession({ children, preview }: { children: ReactNode; preview: boolean }) {
  const { accessToken } = useAuth()
  const { selectedWorkspaceId, loading: workspacesLoading } = useWorkspace()
  const [projects, setProjects] = useState<Project[]>(() =>
    import.meta.env.DEV && preview ? previewProjects() : initialProjects,
  )
  useEffect(() => {
    if (!accessToken || preview || workspacesLoading) return
    let active = true
    projectApi.list(accessToken, selectedWorkspaceId ?? undefined).then((records) => {
      if (active) setProjects(records.map((record) => ({
        ...record,
        description: record.description ?? "",
        status: (record.status ?? "Planning") as Project["status"],
        icon: record.icon as Project["icon"],
        accent: record.accent as Project["accent"],
        health: record.health as Project["health"],
        dueDate: record.dueDate ?? undefined,
      })))
    }).catch(() => { if (active) setProjects([]) })
    return () => { active = false }
  }, [accessToken, preview, selectedWorkspaceId, workspacesLoading])
  const value = useMemo(() => ({ projects, setProjects }), [projects])

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

function previewProjects(): Project[] {
  return [
    { id: 1, name: "WorkSphere", code: "WORK", description: "Core workspace platform", status: "Active", icon: "layers", accent: "violet", progress: 68, completedTasks: 17, totalTasks: 25 },
    { id: 2, name: "Design System", code: "DS", description: "Shared interface components", status: "Active", icon: "layers", accent: "blue", progress: 45, completedTasks: 9, totalTasks: 20 },
    { id: 3, name: "Mobile App", code: "MOB", description: "Mobile workspace experience", status: "Active", icon: "rocket", accent: "rose", progress: 30, completedTasks: 6, totalTasks: 20 },
    { id: 4, name: "Marketing", code: "MKT", description: "Launch and campaign work", status: "Active", icon: "chart", accent: "amber", progress: 20, completedTasks: 4, totalTasks: 20 },
    { id: 5, name: "DevPulse", code: "DEV", description: "Developer tooling and delivery", status: "Active", icon: "code", accent: "teal", progress: 85, completedTasks: 17, totalTasks: 20 },
  ]
}

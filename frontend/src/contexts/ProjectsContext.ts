import { createContext, type Dispatch, type SetStateAction } from "react"

import type { Project } from "@/constants/projects"

export interface ProjectsContextValue {
  projects: Project[]
  setProjects: Dispatch<SetStateAction<Project[]>>
}

export const ProjectsContext = createContext<ProjectsContextValue | null>(null)

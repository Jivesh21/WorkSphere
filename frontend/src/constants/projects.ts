export type ProjectStatus =
  | "Active"
  | "Planning"
  | "Completed"

export type ProjectHealth =
  | "On track"
  | "At risk"

export interface Project {
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

export const initialProjects: Project[] = []
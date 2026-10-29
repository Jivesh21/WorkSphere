import {
  BarChart3,
  Briefcase,
  Code2,
  Compass,
  FolderKanban,
  Layers,
  Rocket,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

export type ProjectStatus =
  | "Active"
  | "Planning"
  | "Completed"

export type ProjectHealth =
  | "On track"
  | "At risk"

export type ProjectIconId = "folder" | "layers" | "rocket" | "compass" | "code" | "briefcase" | "chart" | "shield"
export type ProjectAccent = "violet" | "blue" | "teal" | "amber" | "rose" | "slate"

export const projectIconOptions: Array<{ id: ProjectIconId; label: string; Icon: LucideIcon }> = [
  { id: "folder", label: "Folder", Icon: FolderKanban },
  { id: "layers", label: "Layers", Icon: Layers },
  { id: "rocket", label: "Rocket", Icon: Rocket },
  { id: "compass", label: "Compass", Icon: Compass },
  { id: "code", label: "Code", Icon: Code2 },
  { id: "briefcase", label: "Briefcase", Icon: Briefcase },
  { id: "chart", label: "Analytics", Icon: BarChart3 },
  { id: "shield", label: "Shield", Icon: ShieldCheck },
]

export const projectAccentOptions: Array<{
  id: ProjectAccent
  label: string
  swatch: string
  icon: string
  iconBackground: string
}> = [
  { id: "violet", label: "Violet", swatch: "bg-violet-500", icon: "text-violet-700 dark:text-violet-300", iconBackground: "bg-violet-500/10" },
  { id: "blue", label: "Blue", swatch: "bg-blue-500", icon: "text-blue-700 dark:text-blue-300", iconBackground: "bg-blue-500/10" },
  { id: "teal", label: "Teal", swatch: "bg-teal-500", icon: "text-teal-700 dark:text-teal-300", iconBackground: "bg-teal-500/10" },
  { id: "amber", label: "Amber", swatch: "bg-amber-500", icon: "text-amber-700 dark:text-amber-300", iconBackground: "bg-amber-500/10" },
  { id: "rose", label: "Rose", swatch: "bg-rose-500", icon: "text-rose-700 dark:text-rose-300", iconBackground: "bg-rose-500/10" },
  { id: "slate", label: "Slate", swatch: "bg-slate-500", icon: "text-slate-700 dark:text-slate-300", iconBackground: "bg-slate-500/10" },
]

export interface Project {
  id: number
  name: string
  code: string
  description: string
  status: ProjectStatus
  /** Optional for older project records; UI falls back to folder/violet. */
  icon?: ProjectIconId
  accent?: ProjectAccent
  dueDate?: string
  /** Reserved for project data supplied by the backend. */
  health?: ProjectHealth
  progress?: number
  completedTasks?: number
  totalTasks?: number
  members?: number
}

export const initialProjects: Project[] = []

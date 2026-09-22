export type MemberRole =
  | "Admin"
  | "Developer"
  | "Designer"

export type MemberStatus =
  | "Available"
  | "Busy"
  | "Away"

export type RoleFilter =
  | "All"
  | MemberRole

export interface TeamMember {
  id: string
  name: string
  initials: string
  role: MemberRole
  status: MemberStatus
  email: string
  projects: number
  tasks: number
  completedTasks: number
  workload: number
}
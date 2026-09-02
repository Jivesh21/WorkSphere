export type WorkspaceRole = "Owner" | "Admin" | "Worker"

export interface Workspace {
  id: string
  name: string
  description: string
  role: WorkspaceRole
}
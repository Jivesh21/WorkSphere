import { apiRequest } from "@/services/apiClient"

const body = (method: string, value?: unknown): RequestInit => ({ method, ...(value === undefined ? {} : { body: JSON.stringify(value) }) })

export const projectApi = {
  list: (token: string, workspaceId?: number) => apiRequest<ProjectRecord[]>(`/api/projects${workspaceId ? `?workspaceId=${workspaceId}` : ""}`, token),
  get: (token: string, id: number) => apiRequest<ProjectRecord>(`/api/projects/${id}`, token),
  create: (token: string, input: ProjectInput) => apiRequest<ProjectRecord>("/api/projects", token, body("POST", input)),
  update: (token: string, id: number, input: ProjectInput) => apiRequest<ProjectRecord>(`/api/projects/${id}`, token, body("PUT", input)),
  delete: (token: string, id: number) => apiRequest<void>(`/api/projects/${id}`, token, body("DELETE")),
}

export const issueApi = {
  list: (token: string) => apiRequest<IssueRecord[]>("/api/issues", token),
  byProject: (token: string, projectId: number) => apiRequest<IssueRecord[]>(`/api/issues/project/${projectId}`, token),
  get: (token: string, id: number) => apiRequest<IssueRecord>(`/api/issues/${id}`, token),
  create: (token: string, input: IssueInput) => apiRequest<IssueRecord>("/api/issues", token, body("POST", input)),
  update: (token: string, id: number, input: IssueInput) => apiRequest<IssueRecord>(`/api/issues/${id}`, token, body("PUT", input)),
  delete: (token: string, id: number) => apiRequest<void>(`/api/issues/${id}`, token, body("DELETE")),
}

export const taskApi = {
  list: (token: string) => apiRequest<TaskRecord[]>("/api/tasks", token),
  byProject: (token: string, projectId: number) => apiRequest<TaskRecord[]>(`/api/tasks/project/${projectId}`, token),
  get: (token: string, id: number) => apiRequest<TaskRecord>(`/api/tasks/${id}`, token),
  create: (token: string, input: TaskInput) => apiRequest<TaskRecord>("/api/tasks", token, body("POST", input)),
  update: (token: string, id: number, input: TaskInput) => apiRequest<TaskRecord>(`/api/tasks/${id}`, token, body("PUT", input)),
  delete: (token: string, id: number) => apiRequest<void>(`/api/tasks/${id}`, token, body("DELETE")),
}

export const commentApi = {
  forTask: (token: string, id: number) => apiRequest<CommentRecord[]>(`/api/comments/task/${id}`, token),
  forIssue: (token: string, id: number) => apiRequest<CommentRecord[]>(`/api/comments/issue/${id}`, token),
  create: (token: string, input: CommentInput) => apiRequest<CommentRecord>("/api/comments", token, body("POST", input)),
  update: (token: string, id: number, input: CommentInput) => apiRequest<CommentRecord>(`/api/comments/${id}`, token, body("PUT", input)),
  delete: (token: string, id: number) => apiRequest<void>(`/api/comments/${id}`, token, body("DELETE")),
}

export const sprintApi = {
  list: (token: string) => apiRequest<SprintRecord[]>("/api/sprints", token),
  byProject: (token: string, id: number) => apiRequest<SprintRecord[]>(`/api/sprints/project/${id}`, token),
  byStatus: (token: string, status: string) => apiRequest<SprintRecord[]>(`/api/sprints/status/${status}`, token),
  get: (token: string, id: number) => apiRequest<SprintRecord>(`/api/sprints/${id}`, token),
  create: (token: string, input: SprintInput) => apiRequest<SprintRecord>("/api/sprints", token, body("POST", input)),
  update: (token: string, id: number, input: SprintInput) => apiRequest<SprintRecord>(`/api/sprints/${id}`, token, body("PUT", input)),
  delete: (token: string, id: number) => apiRequest<void>(`/api/sprints/${id}`, token, body("DELETE")),
}

export const activityApi = {
  list: (token: string) => apiRequest<ActivityRecord[]>("/api/activities", token),
  byProject: (token: string, id: number) => apiRequest<ActivityRecord[]>(`/api/activities/project/${id}`, token),
  byUser: (token: string, id: number) => apiRequest<ActivityRecord[]>(`/api/activities/user/${id}`, token),
  byTask: (token: string, id: number) => apiRequest<ActivityRecord[]>(`/api/activities/task/${id}`, token),
  byIssue: (token: string, id: number) => apiRequest<ActivityRecord[]>(`/api/activities/issue/${id}`, token),
  bySprint: (token: string, id: number) => apiRequest<ActivityRecord[]>(`/api/activities/sprint/${id}`, token),
}

export const analyticsApi = {
  get: (token: string) => apiRequest<AnalyticsRecord>("/api/analytics", token),
}

export const workspaceApi = {
  list: (token: string) => apiRequest<WorkspaceRecord[]>("/api/workspaces", token),
  get: (token: string, id: number) => apiRequest<WorkspaceRecord>(`/api/workspaces/${id}`, token),
  create: (token: string, input: WorkspaceInput) => apiRequest<WorkspaceRecord>("/api/workspaces", token, body("POST", input)),
  update: (token: string, id: number, input: WorkspaceInput) => apiRequest<WorkspaceRecord>(`/api/workspaces/${id}`, token, body("PUT", input)),
  delete: (token: string, id: number) => apiRequest<void>(`/api/workspaces/${id}`, token, body("DELETE")),
  members: (token: string, id: number) => apiRequest<WorkspaceMemberRecord[]>(`/api/workspaces/${id}/members`, token),
  myMembership: (token: string, id: number) => apiRequest<WorkspaceMemberRecord>(`/api/workspaces/${id}/members/me`, token),
  addMember: (token: string, id: number, email: string) => apiRequest<WorkspaceMemberRecord>(`/api/workspaces/${id}/members`, token, body("POST", { email })),
  changeMemberRole: (token: string, workspaceId: number, memberId: number, role: string) => apiRequest<WorkspaceMemberRecord>(`/api/workspaces/${workspaceId}/members/${memberId}/role`, token, body("PATCH", { role })),
  removeMember: (token: string, workspaceId: number, memberId: number) => apiRequest<void>(`/api/workspaces/${workspaceId}/members/${memberId}`, token, body("DELETE")),
  leave: (token: string, id: number) => apiRequest<void>(`/api/workspaces/${id}/members/leave`, token, body("POST")),
  transferOwnership: (token: string, id: number, newOwnerMemberId: number) => apiRequest<WorkspaceRecord>(`/api/workspaces/${id}/transfer-ownership`, token, body("POST", { newOwnerMemberId })),
}

export const userApi = {
  list: (token: string) => apiRequest<UserRecord[]>("/api/users", token),
  get: (token: string, id: number) => apiRequest<UserRecord>(`/api/users/${id}`, token),
  changeRole: (token: string, id: number, role: string) => apiRequest<UserRecord>(`/api/users/${id}/role`, token, body("PATCH", { role })),
  setEnabled: (token: string, id: number, enabled: boolean) => apiRequest<UserRecord>(`/api/users/${id}/status?enabled=${enabled}`, token, body("PATCH")),
}

export interface ProjectInput { name: string; code: string; description?: string; status?: string; icon?: string; accent?: string; dueDate?: string | null; health?: string | null; workspaceId?: number }
export interface ProjectRecord extends ProjectInput { id: number; progress?: number; completedTasks?: number; totalTasks?: number; workspaceId?: number; ownerId?: number }
export interface IssueInput { title: string; description?: string; type?: string; status?: string; priority?: string; projectId?: number | null; assignedUserId?: number | null; actorUserId?: number }
export interface IssueRecord extends IssueInput { id: number; type?: string; status?: string; priority?: string; createdAt?: string; updatedAt?: string }
export interface TaskInput { title: string; description?: string; status?: string; priority?: string; dueDate?: string | null; projectId?: number | null; assignedUserId?: number | null; actorUserId?: number }
export interface TaskRecord extends TaskInput { id: number; createdAt?: string; updatedAt?: string }
export interface CommentInput { content?: string; text?: string; taskId?: number; issueId?: number; authorId?: number }
export interface CommentRecord extends CommentInput { id: number; createdAt?: string; updatedAt?: string }
export interface SprintInput { [key: string]: unknown }
export interface SprintRecord extends SprintInput { id: number; name?: string; goal?: string; status?: string; startDate?: string; endDate?: string; projectId?: number }
export interface ActivityRecord { id: number; actorUserId?: number; type?: string; description?: string; projectId?: number; taskId?: number; issueId?: number; sprintId?: number; createdAt?: string }
export interface AnalyticsRecord { [key: string]: number }
export interface WorkspaceRecord { id: number; name: string; description?: string | null; ownerId?: number; createdAt?: string; updatedAt?: string }
export interface WorkspaceInput { name: string; description?: string | null }
export interface WorkspaceMemberRecord { id: number; userId?: number; userName?: string; userEmail?: string; role?: string; joinedAt?: string }
export interface UserRecord { id: number; name: string; email: string; role?: string; enabled?: boolean }

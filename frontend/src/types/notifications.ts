export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "ISSUE_ASSIGNED"
  | "ISSUE_UPDATED"
  | "ISSUE_STATUS_CHANGED"
  | "SPRINT_STARTED"
  | "SPRINT_COMPLETED"
  | "COMMENT_ADDED"
  | "PROJECT_UPDATE"

export type NotificationStatus = "UNREAD" | "READ"

export interface NotificationRecord {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  taskId: number | null
  issueId: number | null
  projectId: number | null
  sprintId: number | null
  status: NotificationStatus
  createdAt: string
  readAt: string | null
}

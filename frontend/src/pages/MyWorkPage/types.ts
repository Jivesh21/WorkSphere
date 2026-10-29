/** Values mirror the current Spring task enums where a matching value exists. */
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW"

export type TaskStatusFilter = "All" | TaskStatus
export type PriorityFilter = "All" | TaskPriority

export type SortOption = "Due date" | "Priority" | "Created date" | "Title"

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  /** Start dates are frontend-only until the backend task contract supports them. */
  startDate: string
  dueDate: string
  projectId: number | null
  projectName: string | null
  assignedUserId: number | null
  assignedUserName: string | null
  subtasks: TaskSubtask[]
  createdAt?: string
  updatedAt?: string
}

export interface TaskSubtask {
  id: number
  title: string
  completed: boolean
}

export type TaskFormValues = Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks">
export type NewTaskData = TaskFormValues

export interface ProjectOption {
  id: number
  name: string
}

export interface MemberOption {
  id: number
  name: string
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
}

export const taskPriorityLabels: Record<TaskPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

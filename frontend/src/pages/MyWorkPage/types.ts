export type TaskStatus = "To do" | "In progress" | "Done"

export type TaskPriority = "High" | "Medium" | "Low"

export type PriorityFilter = "All" | TaskPriority

export type SortOption = "Due date" | "Priority" | "Title"

export interface Task {
  id: number
  title: string
  project: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  dueLabel: string
}
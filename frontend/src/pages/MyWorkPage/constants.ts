import type {
  PriorityFilter,
  SortOption,
  TaskPriority,
  TaskStatus,
  TaskStatusFilter,
} from "./types"

export const taskStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
export const statusFilters: TaskStatusFilter[] = ["All", ...taskStatuses]

export const priorityFilters: PriorityFilter[] = ["All", "HIGH", "MEDIUM", "LOW"]

export const sortOptions: SortOption[] = ["Due date", "Priority", "Created date", "Title"]

export const priorityOrder: Record<TaskPriority, number> = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

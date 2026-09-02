import type {
  PriorityFilter,
  SortOption,
  TaskPriority,
} from "./types"

export const statusFilters = [
  "All",
  "To do",
  "In progress",
  "Done",
] as const

export const priorityFilters: PriorityFilter[] = [
  "All",
  "High",
  "Medium",
  "Low",
]

export const sortOptions: SortOption[] = [
  "Due date",
  "Priority",
  "Title",
]

export const priorityOrder: Record<TaskPriority, number> = {
  High: 1,
  Medium: 2,
  Low: 3,
}

export const dueDateOrder: Record<string, number> = {}
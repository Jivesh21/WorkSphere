import type { Task } from "@/pages/MyWorkPage/types"

export interface TaskProgress {
  completed: number
  total: number
  percentage: number
}

export function getTaskProgress(task: Task): TaskProgress | null {
  if (task.subtasks.length === 0) return null
  const completed = task.subtasks.filter((subtask) => subtask.completed).length
  return {
    completed,
    total: task.subtasks.length,
    percentage: Math.round((completed / task.subtasks.length) * 100),
  }
}

export function getProjectProgress(tasks: Task[]): TaskProgress | null {
  const measurableTasks = tasks.filter((task) => task.subtasks.length > 0)
  const total = measurableTasks.reduce((count, task) => count + task.subtasks.length, 0)
  if (total === 0) return null
  const completed = measurableTasks.reduce(
    (count, task) => count + task.subtasks.filter((subtask) => subtask.completed).length,
    0,
  )
  return { completed, total, percentage: Math.round((completed / total) * 100) }
}

import type { NewTaskData, Task, TaskFormValues, TaskSubtask } from "@/pages/MyWorkPage/types"

type Listener = () => void

const tasksByOwner = new Map<string, Task[]>()
const listenersByOwner = new Map<string, Set<Listener>>()
const emptyTasks: Task[] = []

function dateOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function notify(ownerKey: string) {
  listenersByOwner.get(ownerKey)?.forEach((listener) => listener())
}

export const taskRepository = {
  seedDevelopmentPreview(ownerKey: string): void {
    if (!import.meta.env.DEV || ownerKey !== "0" || tasksByOwner.has(ownerKey)) return
    const timestamp = new Date().toISOString()
    tasksByOwner.set(ownerKey, [
      { id: 1, title: "Implement authentication API", description: "Complete the authentication API integration.", status: "IN_PROGRESS", priority: "HIGH", startDate: "", dueDate: dateOffset(0), projectId: 1, projectName: "WorkSphere", assignedUserId: 1, assignedUserName: "Raman", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 2, title: "Design project dashboard UI", description: "Refine project overview and dashboard patterns.", status: "IN_REVIEW", priority: "MEDIUM", startDate: "", dueDate: dateOffset(1), projectId: 2, projectName: "Design System", assignedUserId: 2, assignedUserName: "Monika", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 3, title: "Fix real-time notification bug", description: "Resolve notification delivery and unread state updates.", status: "TODO", priority: "HIGH", startDate: "", dueDate: dateOffset(2), projectId: 3, projectName: "Mobile App", assignedUserId: 1, assignedUserName: "Raman", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 4, title: "Write API documentation", description: "Document project and task endpoints.", status: "TODO", priority: "LOW", startDate: "", dueDate: dateOffset(4), projectId: 1, projectName: "WorkSphere", assignedUserId: 0, assignedUserName: "Demo User", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 5, title: "Create product launch page", description: "Prepare campaign landing page content and layout.", status: "IN_PROGRESS", priority: "MEDIUM", startDate: "", dueDate: dateOffset(6), projectId: 4, projectName: "Marketing", assignedUserId: 2, assignedUserName: "Monika", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 6, title: "Configure CI/CD pipeline", description: "Improve build checks and deployment workflow.", status: "DONE", priority: "MEDIUM", startDate: "", dueDate: dateOffset(-1), projectId: 5, projectName: "DevPulse", assignedUserId: 3, assignedUserName: "Jivesh Sharma", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 7, title: "Review accessibility states", description: "Check focus and keyboard interactions.", status: "IN_REVIEW", priority: "LOW", startDate: "", dueDate: dateOffset(5), projectId: 2, projectName: "Design System", assignedUserId: 0, assignedUserName: "Demo User", subtasks: [], createdAt: timestamp, updatedAt: timestamp },
    ])
    notify(ownerKey)
  },

  getSnapshot(ownerKey: string): Task[] {
    return tasksByOwner.get(ownerKey) ?? emptyTasks
  },

  subscribe(ownerKey: string, listener: Listener) {
    const listeners = listenersByOwner.get(ownerKey) ?? new Set<Listener>()
    listeners.add(listener)
    listenersByOwner.set(ownerKey, listeners)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) listenersByOwner.delete(ownerKey)
    }
  },

  create(ownerKey: string, values: NewTaskData): Task {
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    const nextId = tasks.reduce((highest, task) => Math.max(highest, task.id), 0) + 1
    const timestamp = new Date().toISOString()
    const task: Task = {
      ...values,
      id: nextId,
      subtasks: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    tasksByOwner.set(ownerKey, [task, ...tasks])
    notify(ownerKey)
    return task
  },

  update(ownerKey: string, id: number, values: TaskFormValues): Task | undefined {
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    const existing = tasks.find((task) => task.id === id)
    if (!existing) return undefined

    const updated: Task = { ...existing, ...values, updatedAt: new Date().toISOString() }
    tasksByOwner.set(ownerKey, tasks.map((task) => task.id === id ? updated : task))
    notify(ownerKey)
    return updated
  },

  toggleCompletion(ownerKey: string, id: number): void {
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    tasksByOwner.set(ownerKey, tasks.map((task) => task.id === id
      ? { ...task, status: task.status === "DONE" ? "TODO" : "DONE", updatedAt: new Date().toISOString() }
      : task,
    ))
    notify(ownerKey)
  },

  addSubtask(ownerKey: string, id: number, title: string): TaskSubtask | undefined {
    const normalizedTitle = title.trim()
    if (!normalizedTitle || normalizedTitle.length > 120) return undefined
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    const existing = tasks.find((task) => task.id === id)
    if (!existing) return undefined

    const nextId = existing.subtasks.reduce((highest, subtask) => Math.max(highest, subtask.id), 0) + 1
    const subtask: TaskSubtask = { id: nextId, title: normalizedTitle, completed: false }
    tasksByOwner.set(ownerKey, tasks.map((task) => task.id === id
      ? { ...task, subtasks: [...task.subtasks, subtask], updatedAt: new Date().toISOString() }
      : task,
    ))
    notify(ownerKey)
    return subtask
  },

  renameSubtask(ownerKey: string, id: number, subtaskId: number, title: string): boolean {
    const normalizedTitle = title.trim()
    if (!normalizedTitle || normalizedTitle.length > 120) return false
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    const existing = tasks.find((task) => task.id === id)
    if (!existing?.subtasks.some((subtask) => subtask.id === subtaskId)) return false

    tasksByOwner.set(ownerKey, tasks.map((task) => task.id === id
      ? {
          ...task,
          subtasks: task.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, title: normalizedTitle } : subtask),
          updatedAt: new Date().toISOString(),
        }
      : task,
    ))
    notify(ownerKey)
    return true
  },

  toggleSubtask(ownerKey: string, id: number, subtaskId: number): void {
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    const existing = tasks.find((task) => task.id === id)
    if (!existing?.subtasks.some((subtask) => subtask.id === subtaskId)) return

    tasksByOwner.set(ownerKey, tasks.map((task) => task.id === id
      ? {
          ...task,
          subtasks: task.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask),
          updatedAt: new Date().toISOString(),
        }
      : task,
    ))
    notify(ownerKey)
  },

  deleteSubtask(ownerKey: string, id: number, subtaskId: number): void {
    const tasks = tasksByOwner.get(ownerKey) ?? emptyTasks
    const existing = tasks.find((task) => task.id === id)
    if (!existing?.subtasks.some((subtask) => subtask.id === subtaskId)) return

    tasksByOwner.set(ownerKey, tasks.map((task) => task.id === id
      ? { ...task, subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId), updatedAt: new Date().toISOString() }
      : task,
    ))
    notify(ownerKey)
  },
}

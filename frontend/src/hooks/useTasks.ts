import { useCallback, useEffect, useSyncExternalStore } from "react"

import useAuth from "@/hooks/useAuth"
import { taskRepository } from "@/services/taskRepository"
import { taskApi } from "@/services/workspaceApi"
import type { Task } from "@/pages/MyWorkPage/types"

/** Subscribe to the signed-in user's session task repository. */
export default function useTasks() {
  const { user, isDevelopmentPreview, accessToken } = useAuth()
  const ownerKey = String(user?.id ?? "anonymous")
  useEffect(() => {
    if (isDevelopmentPreview) taskRepository.seedDevelopmentPreview(ownerKey)
  }, [isDevelopmentPreview, ownerKey])
  useEffect(() => {
    if (!accessToken || isDevelopmentPreview) return
    let active = true
    taskApi.list(accessToken).then((records) => {
      if (!active) return
      const tasks: Task[] = records.map((record) => ({ id: record.id, title: record.title, description: record.description ?? "", status: (record.status ?? "TODO") as Task["status"], priority: (record.priority ?? "MEDIUM") as Task["priority"], startDate: "", dueDate: record.dueDate?.slice(0, 10) ?? "", projectId: record.projectId ?? null, projectName: record.projectId ? `Project #${record.projectId}` : null, assignedUserId: record.assignedUserId ?? null, assignedUserName: record.assignedUserId ? `User #${record.assignedUserId}` : null, subtasks: [], createdAt: record.createdAt, updatedAt: record.updatedAt }))
      taskRepository.replace(ownerKey, tasks)
    }).catch(() => { if (active) taskRepository.replace(ownerKey, []) })
    return () => { active = false }
  }, [accessToken, isDevelopmentPreview, ownerKey])
  const subscribe = useCallback(
    (listener: () => void) => taskRepository.subscribe(ownerKey, listener),
    [ownerKey],
  )
  const getSnapshot = useCallback(
    () => taskRepository.getSnapshot(ownerKey),
    [ownerKey],
  )
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return { tasks, ownerKey, accessToken, isDevelopmentPreview, user }
}

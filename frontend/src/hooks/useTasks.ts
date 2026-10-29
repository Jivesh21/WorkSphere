import { useCallback, useEffect, useSyncExternalStore } from "react"

import useAuth from "@/hooks/useAuth"
import { taskRepository } from "@/services/taskRepository"

/** Subscribe to the signed-in user's session task repository. */
export default function useTasks() {
  const { user, isDevelopmentPreview } = useAuth()
  const ownerKey = String(user?.id ?? "anonymous")
  useEffect(() => {
    if (isDevelopmentPreview) taskRepository.seedDevelopmentPreview(ownerKey)
  }, [isDevelopmentPreview, ownerKey])
  const subscribe = useCallback(
    (listener: () => void) => taskRepository.subscribe(ownerKey, listener),
    [ownerKey],
  )
  const getSnapshot = useCallback(
    () => taskRepository.getSnapshot(ownerKey),
    [ownerKey],
  )
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return { tasks, ownerKey }
}

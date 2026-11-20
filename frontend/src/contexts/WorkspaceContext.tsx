import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import useAuth from "@/hooks/useAuth"
import { workspaceApi, type WorkspaceRecord } from "@/services/workspaceApi"

interface WorkspaceContextValue {
  workspaces: WorkspaceRecord[]
  selectedWorkspace: WorkspaceRecord | null
  selectedWorkspaceId: number | null
  loading: boolean
  error: string
  selectWorkspace: (id: number) => void
  reloadWorkspaces: () => Promise<void>
  addWorkspace: (workspace: WorkspaceRecord) => void
  replaceWorkspace: (workspace: WorkspaceRecord) => void
  removeWorkspace: (id: number) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { accessToken, user, isDevelopmentPreview } = useAuth()
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const storageKey = `worksphere_selected_workspace_${user?.id ?? "anonymous"}`

  const reloadWorkspaces = useCallback(async () => {
    if (!accessToken || isDevelopmentPreview) { setWorkspaces([]); setSelectedWorkspaceId(null); setLoading(false); return }
    setLoading(true)
    setError("")
    try {
      const records = await workspaceApi.list(accessToken)
      setWorkspaces(records)
      setSelectedWorkspaceId((current) => {
        const storedId = Number(localStorage.getItem(storageKey))
        const nextId = records.some((item) => item.id === current) ? current : records.some((item) => item.id === storedId) ? storedId : records[0]?.id ?? null
        if (nextId === null) localStorage.removeItem(storageKey)
        else localStorage.setItem(storageKey, String(nextId))
        return nextId
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load workspaces.")
    } finally { setLoading(false) }
  }, [accessToken, isDevelopmentPreview, storageKey])

  useEffect(() => { void reloadWorkspaces() }, [reloadWorkspaces])

  const selectWorkspace = useCallback((id: number) => {
    if (!workspaces.some((workspace) => workspace.id === id)) return
    setSelectedWorkspaceId(id)
    localStorage.setItem(storageKey, String(id))
  }, [storageKey, workspaces])

  const addWorkspace = useCallback((workspace: WorkspaceRecord) => {
    setWorkspaces((current) => [workspace, ...current])
    setSelectedWorkspaceId(workspace.id)
    localStorage.setItem(storageKey, String(workspace.id))
  }, [storageKey])

  const replaceWorkspace = useCallback((workspace: WorkspaceRecord) => setWorkspaces((current) => current.map((item) => item.id === workspace.id ? workspace : item)), [])
  const removeWorkspace = useCallback((id: number) => {
    const remaining = workspaces.filter((workspace) => workspace.id !== id)
    setWorkspaces(remaining)
    if (selectedWorkspaceId !== id) return
    const next = remaining[0]?.id ?? null
    setSelectedWorkspaceId(next)
    if (next === null) localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, String(next))
  }, [selectedWorkspaceId, storageKey, workspaces])

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null
  const value = useMemo(() => ({ workspaces, selectedWorkspace, selectedWorkspaceId, loading, error, selectWorkspace, reloadWorkspaces, addWorkspace, replaceWorkspace, removeWorkspace }), [workspaces, selectedWorkspace, selectedWorkspaceId, loading, error, selectWorkspace, reloadWorkspaces, addWorkspace, replaceWorkspace, removeWorkspace])
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export default function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider")
  return context
}

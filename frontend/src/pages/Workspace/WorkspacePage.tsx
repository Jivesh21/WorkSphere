import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import useAuth from "@/hooks/useAuth"
import { workspaceApi, type WorkspaceMemberRecord, type WorkspaceRecord } from "@/services/workspaceApi"

function WorkspacePage() {
  const { accessToken, isDevelopmentPreview } = useAuth()
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([])
  const [members, setMembers] = useState<Record<number, WorkspaceMemberRecord[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!accessToken || isDevelopmentPreview) { setLoading(false); return }
    let active = true
    setLoading(true)
    setError("")
    workspaceApi.list(accessToken).then(async (records) => {
      const memberResults = await Promise.all(records.map(async (workspace) => {
        try { return [workspace.id, await workspaceApi.members(accessToken, workspace.id)] as const }
        catch { return [workspace.id, []] as const }
      }))
      if (!active) return
      setWorkspaces(records)
      setMembers(Object.fromEntries(memberResults))
    }).catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Could not load workspaces.")
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [accessToken, isDevelopmentPreview])

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <section>
          <p className="text-xs font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Workspace</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Your workspaces and their current members.</p>
        </section>
        {isDevelopmentPreview ? <section className="rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Workspace records are available after signing in to a connected account.</section>
          : loading ? <section className="rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Loading workspaces…</section>
          : error ? <section role="alert" className="rounded-xl border border-destructive/30 bg-card px-6 py-8 text-sm text-destructive">{error}</section>
          : workspaces.length === 0 ? <section className="rounded-xl border border-border bg-card px-6 py-12 text-center"><p className="text-sm font-medium">No workspaces yet</p><p className="mt-1 text-xs text-muted-foreground">Create or join a workspace to collaborate with your team.</p></section>
          : <div className="grid gap-4 lg:grid-cols-2">{workspaces.map((workspace) => <section key={workspace.id} className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">{workspace.name}</h2>
            {workspace.description && <p className="mt-1 text-sm text-muted-foreground">{workspace.description}</p>}
            <h3 className="mt-5 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Members <span className="ml-1 tabular-nums">{members[workspace.id]?.length ?? 0}</span></h3>
            <ul className="divide-y divide-border">{(members[workspace.id] ?? []).map((member) => <li key={member.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{member.userName ?? `User ${member.userId ?? ""}`}</p><p className="truncate text-xs text-muted-foreground">{member.userEmail ?? ""}</p></div><span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">{member.role ?? "Member"}</span></li>)}</ul>
          </section>)}</div>}
      </div>
    </DashboardLayout>
  )
}

export default WorkspacePage

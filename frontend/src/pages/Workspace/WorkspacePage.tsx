import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { ArrowRight, Building2, Check, Crown, MailPlus, Pencil, Plus, RefreshCw, Settings2, Trash2, UserMinus, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useAuth from "@/hooks/useAuth"
import useProjects from "@/hooks/useProjects"
import useWorkspace from "@/contexts/WorkspaceContext"
import { workspaceApi, type WorkspaceMemberRecord } from "@/services/workspaceApi"

function WorkspacePage() {
  const { accessToken, user, isDevelopmentPreview } = useAuth()
  const { projects } = useProjects()
  const {
    workspaces, selectedWorkspace, selectedWorkspaceId, loading: workspacesLoading,
    error: workspaceError, selectWorkspace, reloadWorkspaces, addWorkspace,
    replaceWorkspace, removeWorkspace,
  } = useWorkspace()
  const [members, setMembers] = useState<WorkspaceMemberRecord[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [busy, setBusy] = useState(false)

  const loadMembers = useCallback(async () => {
    if (!accessToken || !selectedWorkspaceId || isDevelopmentPreview) { setMembers([]); return }
    setMembersLoading(true)
    try { setMembers(await workspaceApi.members(accessToken, selectedWorkspaceId)) }
    catch (error) { setActionError(error instanceof Error ? error.message : "Could not load workspace members.") }
    finally { setMembersLoading(false) }
  }, [accessToken, isDevelopmentPreview, selectedWorkspaceId])

  useEffect(() => { void loadMembers() }, [loadMembers])
  useEffect(() => {
    setActionError("")
    setNotice("")
    setCreating(false)
    setEditing(false)
    setAddingMember(false)
    if (selectedWorkspace) {
      setName(selectedWorkspace.name)
      setDescription(selectedWorkspace.description ?? "")
    } else {
      setName("")
      setDescription("")
    }
  }, [selectedWorkspaceId, selectedWorkspace])

  const myMembership = members.find((member) => member.userId === user?.id)
  const role = myMembership?.role ?? (selectedWorkspace?.ownerId === user?.id ? "OWNER" : "")
  const canManage = role === "OWNER" || role === "ADMIN"
  const isOwner = role === "OWNER" || selectedWorkspace?.ownerId === user?.id
  const projectList = useMemo(() => selectedWorkspaceId === null ? [] : projects.filter((project) => project.workspaceId === selectedWorkspaceId), [projects, selectedWorkspaceId])

  async function submitWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const input = { name: name.trim(), description: description.trim() || null }
    if (!input.name) { setActionError("Enter a workspace name."); return }
    setBusy(true); setActionError(""); setNotice("")
    try {
      if (creating) {
        const saved = await workspaceApi.create(accessToken, input)
        addWorkspace(saved)
        setCreating(false)
        setNotice("Workspace created.")
      } else if (selectedWorkspace) {
        const saved = await workspaceApi.update(accessToken, selectedWorkspace.id, input)
        replaceWorkspace(saved)
        setEditing(false)
        setNotice("Workspace details saved.")
      }
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not save workspace.") }
    finally { setBusy(false) }
  }

  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken || !selectedWorkspaceId) return
    setBusy(true); setActionError(""); setNotice("")
    try {
      const member = await workspaceApi.addMember(accessToken, selectedWorkspaceId, inviteEmail.trim())
      setMembers((current) => [...current, member])
      setInviteEmail("")
      setAddingMember(false)
      setNotice(`${member.userName ?? member.userEmail ?? "Member"} added to the workspace.`)
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not add member.") }
    finally { setBusy(false) }
  }

  async function changeRole(member: WorkspaceMemberRecord, nextRole: string) {
    if (!accessToken || !selectedWorkspaceId) return
    setBusy(true); setActionError("")
    try {
      const updated = await workspaceApi.changeMemberRole(accessToken, selectedWorkspaceId, member.id, nextRole)
      setMembers((current) => current.map((item) => item.id === updated.id ? updated : item))
      setNotice(`${updated.userName ?? "Member"} is now ${nextRole.toLowerCase()}.`)
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not update member role.") }
    finally { setBusy(false) }
  }

  async function removeMember(member: WorkspaceMemberRecord) {
    if (!accessToken || !selectedWorkspaceId || !window.confirm(`Remove ${member.userName ?? member.userEmail ?? "this member"} from the workspace?`)) return
    setBusy(true); setActionError("")
    try {
      await workspaceApi.removeMember(accessToken, selectedWorkspaceId, member.id)
      setMembers((current) => current.filter((item) => item.id !== member.id))
      setNotice("Member removed.")
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not remove member.") }
    finally { setBusy(false) }
  }

  async function transferOwnership(member: WorkspaceMemberRecord) {
    if (!accessToken || !selectedWorkspace || !window.confirm(`Transfer ownership to ${member.userName ?? member.userEmail ?? "this member"}? You will become an admin.`)) return
    setBusy(true); setActionError("")
    try {
      const updated = await workspaceApi.transferOwnership(accessToken, selectedWorkspace.id, member.id)
      replaceWorkspace(updated)
      setMembers((current) => current.map((item) => item.id === member.id ? { ...item, role: "OWNER" } : item.userId === user?.id ? { ...item, role: "ADMIN" } : item))
      setNotice("Workspace ownership transferred.")
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not transfer ownership.") }
    finally { setBusy(false) }
  }

  async function leaveWorkspace() {
    if (!accessToken || !selectedWorkspace || !window.confirm(`Leave ${selectedWorkspace.name}?`)) return
    setBusy(true); setActionError("")
    try {
      await workspaceApi.leave(accessToken, selectedWorkspace.id)
      removeWorkspace(selectedWorkspace.id)
      setNotice("You left the workspace.")
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not leave workspace.") }
    finally { setBusy(false) }
  }

  async function deleteWorkspace() {
    if (!accessToken || !selectedWorkspace || !window.confirm(`Delete ${selectedWorkspace.name} and remove its members? This cannot be undone.`)) return
    setBusy(true); setActionError("")
    try {
      await workspaceApi.delete(accessToken, selectedWorkspace.id)
      removeWorkspace(selectedWorkspace.id)
      setNotice("Workspace deleted.")
    } catch (error) { setActionError(error instanceof Error ? error.message : "Could not delete workspace.") }
    finally { setBusy(false) }
  }

  if (isDevelopmentPreview) return <DashboardLayout><WorkspaceEmpty title="Workspace management is available for signed-in accounts." description="Sign in to create workspaces, manage members, and organize projects." /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Workspace hub</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Organize projects and manage the people collaborating on them.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {workspaces.length > 0 && <label className="sr-only" htmlFor="workspace-picker">Choose workspace</label>}
            {workspaces.length > 0 && <select id="workspace-picker" value={selectedWorkspaceId ?? ""} onChange={(event) => selectWorkspace(Number(event.target.value))} className="h-9 min-w-48 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {workspaces.map((workspace) => <option value={workspace.id} key={workspace.id}>{workspace.name}</option>)}
            </select>}
            <Button type="button" variant="outline" onClick={() => { setCreating(true); setEditing(false); setName(""); setDescription(""); setActionError("") }} className="gap-2"><Plus className="size-4" />New workspace</Button>
            <Button type="button" variant="outline" onClick={() => void reloadWorkspaces()} disabled={workspacesLoading} aria-label="Refresh workspaces"><RefreshCw className={`size-4 ${workspacesLoading ? "animate-spin" : ""}`} /></Button>
          </div>
        </header>

        {(workspaceError || actionError) && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{actionError || workspaceError}</p>}
        {notice && <p role="status" className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">{notice}</p>}

        {(creating || editing) && <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2"><Building2 className="size-4 text-primary" /><h2 className="text-sm font-semibold">{creating ? "Create a workspace" : "Workspace details"}</h2></div>
          <form onSubmit={submitWorkspace} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div><label htmlFor="workspace-name" className="mb-1.5 block text-xs font-medium">Name</label><Input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /></div>
            <div><label htmlFor="workspace-description" className="mb-1.5 block text-xs font-medium">Description</label><Input id="workspace-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} /></div>
            <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button><Button type="button" variant="outline" onClick={() => { setCreating(false); setEditing(false) }}>Cancel</Button></div>
          </form>
        </section>}

        {workspacesLoading && !selectedWorkspace ? <WorkspaceEmpty title="Loading your workspace…" description="Fetching your workspace and membership details." />
          : !selectedWorkspace ? <WorkspaceEmpty title="Start a workspace" description="Create a workspace to bring projects and teammates together." action={<Button type="button" onClick={() => setCreating(true)} className="mt-4 gap-2"><Plus className="size-4" />Create workspace</Button>} />
          : <>
            <section className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><Building2 className="size-5 text-primary" /><h2 className="truncate text-xl font-semibold">{selectedWorkspace.name}</h2></div>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedWorkspace.description || "No workspace description yet."}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><UsersRound className="size-3.5" />{members.length} {members.length === 1 ? "member" : "members"}</span><span>{projectList.length} {projectList.length === 1 ? "project" : "projects"}</span><span>Your role: <strong className="font-medium text-foreground">{role || "Member"}</strong></span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canManage && <Button type="button" variant="outline" onClick={() => { setEditing(true); setCreating(false) }} className="gap-2"><Pencil className="size-3.5" />Edit</Button>}
                  {canManage && <Button type="button" variant="outline" onClick={() => { setAddingMember((current) => !current); setActionError("") }} className="gap-2"><MailPlus className="size-3.5" />Add member</Button>}
                  {!isOwner && <Button type="button" variant="outline" onClick={() => void leaveWorkspace()} disabled={busy} className="gap-2"><UserMinus className="size-3.5" />Leave</Button>}
                  {isOwner && <Button type="button" variant="destructive" onClick={() => void deleteWorkspace()} disabled={busy} className="gap-2"><Trash2 className="size-3.5" />Delete</Button>}
                </div>
              </div>
              {addingMember && <form onSubmit={submitMember} className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
                <div className="flex-1"><label htmlFor="invite-email" className="mb-1.5 block text-xs font-medium">Account email</label><Input id="invite-email" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@example.com" required /></div>
                <div className="flex items-end gap-2"><Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add to workspace"}</Button><Button type="button" variant="outline" onClick={() => setAddingMember(false)}>Cancel</Button></div>
                <p className="basis-full text-xs text-muted-foreground">The person must already have a WorkSphere account.</p>
              </form>}
            </section>

            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="overflow-hidden rounded-lg border border-border bg-card">
                <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3"><div><h2 className="text-sm font-semibold">Team members</h2><p className="mt-0.5 text-xs text-muted-foreground">Workspace roles control who can manage membership and projects.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs tabular-nums">{members.length}</span></header>
                {membersLoading ? <p className="p-5 text-sm text-muted-foreground">Loading members…</p> : members.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No members found.</p> : <ul className="divide-y divide-border">
                  {members.map((member) => <li key={member.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(member.userName ?? member.userEmail ?? "?")}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{member.userName ?? `User ${member.userId ?? ""}`}</p><p className="truncate text-xs text-muted-foreground">{member.userEmail}</p></div>
                    {member.role === "OWNER" ? <span className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-medium text-primary"><Crown className="size-3" />Owner</span> : canManage ? <select aria-label={`Role for ${member.userName ?? member.userEmail}`} value={member.role ?? "WORKER"} disabled={busy} onChange={(event) => void changeRole(member, event.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="WORKER">Worker</option><option value="ADMIN">Admin</option></select> : <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">{member.role ?? "WORKER"}</span>}
                    {isOwner && member.role !== "OWNER" && <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void transferOwnership(member)} className="gap-1.5 text-xs"><Crown className="size-3.5" />Transfer</Button>}
                    {canManage && member.role !== "OWNER" && <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${member.userName ?? "member"}`} disabled={busy} onClick={() => void removeMember(member)}><Trash2 className="size-4 text-muted-foreground" /></Button>}
                  </li>)}
                </ul>}
              </section>

              <section className="overflow-hidden rounded-lg border border-border bg-card">
                <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3"><div><h2 className="text-sm font-semibold">Workspace projects</h2><p className="mt-0.5 text-xs text-muted-foreground">Projects created here are linked to this workspace.</p></div><Link to="/projects" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">Open projects <ArrowRight className="size-3" /></Link></header>
                {projectList.length ? <ul className="divide-y divide-border">{projectList.map((project) => <li key={project.id} className="flex items-center gap-3 px-4 py-3"><span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground"><Settings2 className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{project.name}</p><p className="text-xs text-muted-foreground">{project.code} · {project.status}</p></div><span className="text-xs tabular-nums text-muted-foreground">{project.progress ?? 0}%</span></li>)}</ul> : <div className="p-5"><p className="text-sm text-muted-foreground">No projects are linked to this workspace yet.</p><Link to="/projects" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">Create the first project <ArrowRight className="size-3" /></Link></div>}
              </section>
            </div>
          </>}
      </div>
    </DashboardLayout>
  )
}

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
}

function WorkspaceEmpty({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <section className="mx-auto flex min-h-56 max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center"><span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Check className="size-5" /></span><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>{action}</section>
}

export default WorkspacePage

import { useEffect, useMemo, useState } from "react"

import useAuth from "@/hooks/useAuth"
import useTasks from "@/hooks/useTasks"
import type { Task } from "@/pages/MyWorkPage/types"
import useWorkspace from "@/contexts/WorkspaceContext"
import useProjects from "@/hooks/useProjects"
import { workspaceApi, type WorkspaceMemberRecord } from "@/services/workspaceApi"

export type WorkloadPeriod = "all" | "7" | "30"
export type WorkloadStatus = "All" | "Open" | "Completed" | "Overdue"

function todayKey() {
  const today = new Date()
  return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0")
}

function daysFromToday(days: number) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0")
}

export function isOverdue(task: Task) {
  return task.status !== "DONE" && Boolean(task.dueDate) && task.dueDate < todayKey()
}

function matchesPeriod(task: Task, period: WorkloadPeriod) {
  if (period === "all") return true
  if (!task.dueDate) return false
  return task.dueDate <= daysFromToday(Number(period))
}

function matchesStatus(task: Task, status: WorkloadStatus) {
  if (status === "Open") return task.status !== "DONE"
  if (status === "Completed") return task.status === "DONE"
  if (status === "Overdue") return isOverdue(task)
  return true
}

function useTeamWorkload() {
  const { user, accessToken, isDevelopmentPreview } = useAuth()
  const { tasks } = useTasks()
  const { projects } = useProjects()
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace()
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<WorkloadPeriod>("all")
  const [status, setStatus] = useState<WorkloadStatus>("All")
  const [members, setMembers] = useState<WorkspaceMemberRecord[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState("")

  useEffect(() => {
    if (!accessToken || !selectedWorkspaceId || isDevelopmentPreview) { setMembers([]); setMembersLoading(false); return }
    let active = true
    setMembersLoading(true)
    setMembersError("")
    workspaceApi.members(accessToken, selectedWorkspaceId).then((result) => { if (active) setMembers(result) }).catch((error) => {
      if (active) setMembersError(error instanceof Error ? error.message : "Could not load workspace members.")
    }).finally(() => { if (active) setMembersLoading(false) })
    return () => { active = false }
  }, [accessToken, isDevelopmentPreview, selectedWorkspaceId])

  const projectIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects])
  const workspaceTasks = useMemo(() => tasks.filter((task) => task.projectId !== null && projectIds.has(task.projectId)), [tasks, projectIds])
  const memberTaskMap = useMemo(() => new Map(members.map((member) => [member.userId, workspaceTasks.filter((task) => task.assignedUserId === member.userId)])), [members, workspaceTasks])
  const visibleMembers = useMemo(() => members.filter((member) => `${member.userName ?? ""} ${member.userEmail ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())), [members, search])
  const matchingTasks = useMemo(() => visibleMembers.flatMap((member) => memberTaskMap.get(member.userId) ?? []).filter((task) => matchesPeriod(task, period) && matchesStatus(task, status)), [visibleMembers, memberTaskMap, period, status])
  const filteredMemberTaskMap = useMemo(() => new Map(visibleMembers.map((member) => [member.userId, (memberTaskMap.get(member.userId) ?? []).filter((task) => matchesPeriod(task, period) && matchesStatus(task, status))])), [visibleMembers, memberTaskMap, period, status])

  const assignedTasks = useMemo(() => user ? workspaceTasks.filter((task) => task.assignedUserId === user.id) : [], [workspaceTasks, user])

  return {
    user,
    workspace: selectedWorkspace,
    members: visibleMembers,
    allMembers: members,
    memberTaskMap,
    filteredMemberTaskMap,
    membersLoading,
    membersError,
    workspaceTasks,
    assignedTasks,
    matchingTasks,
    search,
    setSearch,
    period,
    setPeriod,
    status,
    setStatus,
    counts: {
      assigned: matchingTasks.length,
      open: matchingTasks.filter((task) => task.status !== "DONE").length,
      completed: matchingTasks.filter((task) => task.status === "DONE").length,
      overdue: matchingTasks.filter(isOverdue).length,
    },
  }
}

export default useTeamWorkload

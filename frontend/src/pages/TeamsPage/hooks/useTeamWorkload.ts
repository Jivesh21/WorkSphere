import { useMemo, useState } from "react"

import useAuth from "@/hooks/useAuth"
import useTasks from "@/hooks/useTasks"
import type { Task } from "@/pages/MyWorkPage/types"

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
  const { user } = useAuth()
  const { tasks } = useTasks()
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<WorkloadPeriod>("all")
  const [status, setStatus] = useState<WorkloadStatus>("All")

  const assignedTasks = useMemo(
    () => user ? tasks.filter((task) => task.assignedUserId === user.id) : [],
    [tasks, user],
  )
  const matchingTasks = useMemo(
    () => assignedTasks.filter((task) => matchesPeriod(task, period) && matchesStatus(task, status)),
    [assignedTasks, period, status],
  )
  const memberMatchesSearch = Boolean(user && (user.name + " " + user.email).toLowerCase().includes(search.trim().toLowerCase()))

  return {
    user,
    assignedTasks,
    matchingTasks,
    memberMatchesSearch,
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

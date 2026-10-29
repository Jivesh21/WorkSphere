import { useMemo, useState } from "react"

import { taskRepository } from "@/services/taskRepository"
import useTasks from "@/hooks/useTasks"
import { priorityOrder, sortOptions } from "../constants"
import type { PriorityFilter, SortOption, TaskFormValues, TaskStatusFilter } from "../types"

function useMyWork() {
  const { tasks: taskList, ownerKey } = useTasks()
  const [search, setSearch] = useState("")
  const [activeStatus, setActiveStatus] = useState<TaskStatusFilter>("All")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0])
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [groupByStatus, setGroupByStatus] = useState(false)

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filteredTasks = taskList.filter((task) => {
      const searchable = [task.title, task.description, task.projectName ?? "", task.assignedUserName ?? ""]
        .join(" ")
        .toLowerCase()
      return (normalizedSearch.length === 0 || searchable.includes(normalizedSearch))
        && (activeStatus === "All" || task.status === activeStatus)
        && (priorityFilter === "All" || task.priority === priorityFilter)
        && (!overdueOnly || isTaskOverdue(task))
    })

    return [...filteredTasks].sort((a, b) => {
      if (sortOption === "Title") return a.title.localeCompare(b.title)
      if (sortOption === "Priority") return priorityOrder[a.priority] - priorityOrder[b.priority]
      if (sortOption === "Created date") {
        const aCreated = Date.parse(a.createdAt ?? "") || 0
        const bCreated = Date.parse(b.createdAt ?? "") || 0
        return bCreated - aCreated
      }
      const aDue = a.dueDate ? Date.parse(`${a.dueDate}T00:00:00`) : Number.POSITIVE_INFINITY
      const bDue = b.dueDate ? Date.parse(`${b.dueDate}T00:00:00`) : Number.POSITIVE_INFINITY
      return aDue - bDue
    })
  }, [taskList, search, activeStatus, priorityFilter, overdueOnly, sortOption])

  const todayTasks = visibleTasks.filter((task) => task.dueDate === getTodayDate() && task.status !== "DONE")
  const completedTasks = visibleTasks.filter((task) => task.status === "DONE")
  const upcomingTasks = visibleTasks.filter((task) => task.dueDate !== getTodayDate() && task.status !== "DONE")

  function saveTask(id: number | null, values: TaskFormValues) {
    if (id === null) taskRepository.create(ownerKey, values)
    else taskRepository.update(ownerKey, id, values)
    setSearch("")
    setActiveStatus("All")
    setPriorityFilter("All")
    setOverdueOnly(false)
  }

  function clearFilters() {
    setSearch("")
    setActiveStatus("All")
    setPriorityFilter("All")
    setOverdueOnly(false)
    setSortOption(sortOptions[0])
  }

  const summary = {
    total: taskList.length,
    inProgress: taskList.filter((task) => task.status === "IN_PROGRESS").length,
    dueToday: taskList.filter((task) => task.dueDate === getTodayDate() && task.status !== "DONE").length,
    completed: taskList.filter((task) => task.status === "DONE").length,
  }

  return {
    taskList,
    visibleTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    summary,
    filters: { search, activeStatus, priorityFilter, overdueOnly, sortOption, showFilters, showSort, groupByStatus },
    actions: {
      setSearch,
      setActiveStatus,
      setPriorityFilter,
      setOverdueOnly,
      setSortOption,
      setShowFilters,
      setShowSort,
      setGroupByStatus,
      saveTask,
      handleToggleTask: (taskId: number) => taskRepository.toggleCompletion(ownerKey, taskId),
      addSubtask: (taskId: number, title: string) => Boolean(taskRepository.addSubtask(ownerKey, taskId, title)),
      renameSubtask: (taskId: number, subtaskId: number, title: string) => taskRepository.renameSubtask(ownerKey, taskId, subtaskId, title),
      toggleSubtask: (taskId: number, subtaskId: number) => taskRepository.toggleSubtask(ownerKey, taskId, subtaskId),
      deleteSubtask: (taskId: number, subtaskId: number) => taskRepository.deleteSubtask(ownerKey, taskId, subtaskId),
      clearFilters,
    },
  }
}

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isTaskOverdue(task: { status: string; dueDate: string }) {
  return task.status !== "DONE" && Boolean(task.dueDate) && task.dueDate < getTodayDate()
}

export default useMyWork

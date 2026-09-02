import { useMemo, useState } from "react"

import {
  dueDateOrder,
  priorityOrder,
  sortOptions,
  statusFilters,
} from "../constants"
import type {
  PriorityFilter,
  SortOption,
  Task,
} from "../types"

function useMyWork() {
  const [taskList, setTaskList] = useState<Task[]>([])

  const [search, setSearch] = useState("")

  const [activeStatus, setActiveStatus] =
    useState<(typeof statusFilters)[number]>("All")

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("All")

  const [sortOption, setSortOption] =
    useState<SortOption>(sortOptions[0])

  const [showFilters, setShowFilters] = useState(false)

  const [showSort, setShowSort] = useState(false)

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filteredTasks = taskList.filter((task) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.project.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        activeStatus === "All" ||
        task.status === activeStatus

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    })

    return [...filteredTasks].sort((a, b) => {
      if (sortOption === "Title") {
        return a.title.localeCompare(b.title)
      }

      if (sortOption === "Priority") {
        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        )
      }

      return (
        (dueDateOrder[a.dueDate] ?? 99) -
        (dueDateOrder[b.dueDate] ?? 99)
      )
    })
  }, [
    taskList,
    search,
    activeStatus,
    priorityFilter,
    sortOption,
  ])

  const todayTasks = visibleTasks.filter(
    (task) =>
      task.dueLabel === "Today" &&
      task.status !== "Done",
  )

  const upcomingTasks = visibleTasks.filter(
    (task) =>
      task.dueLabel !== "Today" &&
      task.status !== "Done",
  )

  const completedTasks = visibleTasks.filter(
    (task) => task.status === "Done",
  )

  function handleToggleTask(taskId: number) {
    setTaskList((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        if (task.status === "Done") {
          return {
            ...task,
            status: "To do",
            dueLabel:
              task.dueLabel === "Completed"
                ? "Today"
                : task.dueLabel,
          }
        }

        return {
          ...task,
          status: "Done",
          dueLabel: "Completed",
        }
      }),
    )
  }

  const summary = {
    total: taskList.length,
    inProgress: taskList.filter(
      (task) => task.status === "In progress",
    ).length,
    dueToday: taskList.filter(
      (task) =>
        task.dueLabel === "Today" &&
        task.status !== "Done",
    ).length,
    completed: taskList.filter(
      (task) => task.status === "Done",
    ).length,
  }

  return {
    taskList,
    visibleTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    summary,
    filters: {
      search,
      activeStatus,
      priorityFilter,
      sortOption,
      showFilters,
      showSort,
    },
    actions: {
      setSearch,
      setActiveStatus,
      setPriorityFilter,
      setSortOption,
      setShowFilters,
      setShowSort,
      handleToggleTask,
    },
  }
}

export default useMyWork
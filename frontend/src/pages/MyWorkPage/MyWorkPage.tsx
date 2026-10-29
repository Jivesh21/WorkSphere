

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"

import {
  statusFilters,
  taskStatuses,
} from "./constants"
import EmptyState from "./components/EmptyState"
import SummaryCard from "./components/SummaryCard"
import TaskGroup from "./components/TaskGroup"
import TaskToolbar from "./components/TaskToolbar"
import TaskFormDialog from "./components/CreateTaskDialog"
import TaskDetailsDialog from "./components/TaskDetailsDialog"
import useMyWork from "./hooks/useMyWork"
import type { Task, TaskFormValues } from "./types"
import { taskStatusLabels } from "./types"
import type { TaskVoiceFilter } from "@/lib/voiceCommands"

function MyWorkPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [detailsTaskId, setDetailsTaskId] = useState<number | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if ((location.state as { quickCreate?: string } | null)?.quickCreate !== "task") return
    setEditingTask(undefined)
    setTaskFormOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])
  const {
    taskList,
    visibleTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    summary,
    filters,
    actions,
  } = useMyWork()
  const detailsTask = detailsTaskId === null
    ? undefined
    : taskList.find((task) => task.id === detailsTaskId)

  useEffect(() => {
    const voiceCommand = (location.state as { voiceAssistant?: { kind?: string; filter?: TaskVoiceFilter; label?: string } } | null)?.voiceAssistant
    if (voiceCommand?.kind !== "filter-tasks" || !voiceCommand.filter) return

    if (voiceCommand.filter.kind === "priority") actions.setPriorityFilter(voiceCommand.filter.value)
    if (voiceCommand.filter.kind === "status") actions.setActiveStatus(voiceCommand.filter.value)
    if (voiceCommand.filter.kind === "overdue") actions.setOverdueOnly(true)
    actions.setShowFilters(false)
    navigate(location.pathname, { replace: true, state: null })
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("worksphere:voice-command-applied", { detail: { label: voiceCommand.label } }))
    })
  }, [location.pathname, location.state, navigate, actions])

  function openCreateTask() {
    setEditingTask(undefined)
    setTaskFormOpen(true)
  }

  function closeTaskForm() {
    setTaskFormOpen(false)
    setEditingTask(undefined)
  }

  function saveTask(values: TaskFormValues) {
    actions.saveTask(editingTask?.id ?? null, values)
    closeTaskForm()
  }

  function editTaskFromDetails(task: Task) {
    setDetailsTaskId(null)
    setEditingTask(task)
    setTaskFormOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Personal workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              My Work
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Stay on top of your tasks, priorities, and deadlines.
            </p>
          </div>

          <Button type="button" onClick={openCreateTask} className="w-fit gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Create task
          </Button>
        </section>

        <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Tasks are kept in this app session only. They are not saved to an account or backend yet.
        </p>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            label="Total tasks"
            value={String(summary.total)}
            description="in this session"
          />

          <SummaryCard
            label="In progress"
            value={String(summary.inProgress)}
            description="currently active"
          />

          <SummaryCard
            label="Due today"
            value={String(summary.dueToday)}
            description="need attention"
          />

          <SummaryCard
            label="Completed"
            value={String(summary.completed)}
            description="completed tasks"
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <TaskToolbar
            search={filters.search}
            priorityFilter={filters.priorityFilter}
            overdueOnly={filters.overdueOnly}
            sortOption={filters.sortOption}
            showFilters={filters.showFilters}
            showSort={filters.showSort}
            groupByStatus={filters.groupByStatus}
            resultCount={visibleTasks.length}
            hasActiveFilters={filters.search.length > 0 || filters.activeStatus !== "All" || filters.priorityFilter !== "All" || filters.overdueOnly}
            onSearchChange={actions.setSearch}
            onPriorityChange={(value) => {
              actions.setPriorityFilter(value)
              actions.setShowFilters(false)
            }}
            onToggleOverdue={() => actions.setOverdueOnly(!filters.overdueOnly)}
            onSortChange={(value) => {
              actions.setSortOption(value)
              actions.setShowSort(false)
            }}
            onToggleFilters={() =>
              actions.setShowFilters(
                !filters.showFilters,
              )
            }
            onToggleSort={() =>
              actions.setShowSort(
                !filters.showSort,
              )
            }
            onToggleGroup={() => actions.setGroupByStatus(!filters.groupByStatus)}
            onClearFilters={actions.clearFilters}
          />

          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max items-center gap-1 px-4">
              {statusFilters.map((status) => {
                const isActive =
                  filters.activeStatus === status

                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() =>
                      actions.setActiveStatus(status)
                    }
                    className={[
                      "relative rounded-sm px-3 py-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {status === "All" ? status : taskStatusLabels[status]}

                    {isActive && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {filters.groupByStatus ? taskStatuses.map((status) => (
              <TaskGroup
                key={status}
                title={taskStatusLabels[status]}
                tasks={visibleTasks.filter((task) => task.status === status)}
                onToggleTask={actions.handleToggleTask}
                onEditTask={(task) => { setEditingTask(task); setTaskFormOpen(true) }}
                onViewTask={(task) => setDetailsTaskId(task.id)}
              />
            )) : <>
            <TaskGroup
              title="Today"
              tasks={todayTasks}
              onToggleTask={actions.handleToggleTask}
              onEditTask={(task) => { setEditingTask(task); setTaskFormOpen(true) }}
              onViewTask={(task) => setDetailsTaskId(task.id)}
            />

            <TaskGroup
              title="Other work"
              tasks={upcomingTasks}
              onToggleTask={actions.handleToggleTask}
              onEditTask={(task) => { setEditingTask(task); setTaskFormOpen(true) }}
              onViewTask={(task) => setDetailsTaskId(task.id)}
            />
            </>}

            <TaskGroup
              title="Completed"
              tasks={completedTasks}
              onToggleTask={actions.handleToggleTask}
              onEditTask={(task) => { setEditingTask(task); setTaskFormOpen(true) }}
              onViewTask={(task) => setDetailsTaskId(task.id)}
            />

            {visibleTasks.length === 0 && (
              <EmptyState
                search={filters.search}
                activeStatus={filters.activeStatus}
                hasTasks={summary.total > 0}
                onCreateTask={openCreateTask}
                onClearFilters={actions.clearFilters}
              />
            )}
          </div>
        </section>
      </div>
      {taskFormOpen && (
        <TaskFormDialog
          initialTask={editingTask}
          members={user ? [{ id: user.id, name: user.name }] : []}
          onClose={closeTaskForm}
          onSave={saveTask}
        />
      )}
      {detailsTask && (
        <TaskDetailsDialog
          task={detailsTask}
          onClose={() => setDetailsTaskId(null)}
          onEdit={editTaskFromDetails}
          onAddSubtask={(title) => actions.addSubtask(detailsTask.id, title)}
          onRenameSubtask={(subtaskId, title) => actions.renameSubtask(detailsTask.id, subtaskId, title)}
          onToggleSubtask={(subtaskId) => actions.toggleSubtask(detailsTask.id, subtaskId)}
          onDeleteSubtask={(subtaskId) => actions.deleteSubtask(detailsTask.id, subtaskId)}
        />
      )}
    </DashboardLayout>
  )
}

export default MyWorkPage

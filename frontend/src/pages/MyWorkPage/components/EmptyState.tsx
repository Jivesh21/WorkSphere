interface EmptyStateProps {
  search: string
  activeStatus: string
  hasTasks: boolean
  onCreateTask: () => void
  onClearFilters: () => void
}

function EmptyState({
  search,
  activeStatus,
  hasTasks,
  onCreateTask,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-medium">
        {!hasTasks ? "No tasks yet" : "No matching tasks"}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {!hasTasks
          ? "Create a task to start tracking work in your personal list."
          : search
            ? `No tasks match "${search}".`
            : `There are no ${activeStatus.toLowerCase()} tasks in this session.`}
      </p>
      {!hasTasks ? (
        <button type="button" onClick={onCreateTask} className="mt-4 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
          Create task
        </button>
      ) : (
        <button type="button" onClick={onClearFilters} className="mt-4 rounded-md px-3 py-2 text-xs font-medium text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">
          Clear filters
        </button>
      )}
    </div>
  )
}

export default EmptyState

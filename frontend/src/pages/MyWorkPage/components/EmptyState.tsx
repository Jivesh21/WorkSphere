interface EmptyStateProps {
  search: string
  activeStatus: string
}

function EmptyState({
  search,
  activeStatus,
}: EmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium">
        No tasks found
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {search
          ? `No tasks match "${search}".`
          : `There are no ${activeStatus.toLowerCase()} tasks right now.`}
      </p>
    </div>
  )
}

export default EmptyState
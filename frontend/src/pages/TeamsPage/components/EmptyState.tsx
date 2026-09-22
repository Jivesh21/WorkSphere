function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <p className="text-sm font-medium">
        No team members found
      </p>

      <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
        Team members will appear here once they are added
        to your workspace.
      </p>
    </div>
  )
}

export default EmptyState
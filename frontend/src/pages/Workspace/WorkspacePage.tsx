import DashboardLayout from "@/components/layout/DashboardLayout"

function WorkspacePage() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <section>
          <p className="text-xs font-medium text-muted-foreground">
            Workspace
          </p>

          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
            Workspace
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your workspace, projects, and team collaboration.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium">
            Workspace setup
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your workspace will appear here once it is connected to the backend.
          </p>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default WorkspacePage